import type { Request, Response, NextFunction } from 'express';

import {
    DatasetDto,
    DatasetsDto,
    DatasetUpdateDto,
    DatasetCreationDto,
    DatasetPathParamsDto
} from '#/dto/dataset';
import { ApiError } from '#/exceptions/api';
import { ProjectPathParamsDto } from '#/dto/project';
import { Dataset, Project, Query } from '#/db/models';
import type { ApiResponseSuccess } from '#/dto/api';
import type { DatasetDtoType, DatasetsDtoType } from '#/dto/dataset';
import type { IDataset, IProject, IProjectDatasetPopulated } from '#/db/interfaces';


export async function createDataset(req: Request, res: Response, next: NextFunction) {
    // Validation
    const params = ProjectPathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
        }));
    const datasetCreationParse = DatasetCreationDto.safeParse(req.body);
    if (!datasetCreationParse.success)
        return next(new ApiError({
            message: 'Malformed dataset creation fields',
            statusCode: 422,
            details: datasetCreationParse.error.issues
        }));

    // Retrieve project
    const updatedProject: IProject | null = await Project.findOne({ _id: params.data.projectObjId });
    if (!updatedProject)
        return next(new ApiError({
            message: 'Project with provided ID does not exist',
            statusCode: 422,
            details: { projectObjId: params.data.projectObjId }
        }));
    // Dataset creation
    // All errors are passed to the error handling middleware, as for errors, there are only code 500 responses
    const newDataset: IDataset = await Dataset.create({
        ...datasetCreationParse.data,
        collectionRef: 'UNSET',
        mongooseSchema: datasetCreationParse.data.mongooseSchema ?? { $jsonSchema: null }
    });
    updatedProject.datasetObjIds.push(newDataset._id);
    await updatedProject.save()

    // Response
    const response: ApiResponseSuccess<DatasetDtoType> = {
        success: true,
        data: DatasetDto.parse(newDataset)
    };
    return res.status(200).json(response);
}

export async function getDatasets(req: Request, res: Response, next: NextFunction) {
    // Validation
    const params = ProjectPathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
        }));

    // User retrieval
    const project = await Project.findOne({ _id: params.data.projectObjId })
        .populate<IProjectDatasetPopulated>('datasetObjIds');
    if (!project)
        return next(new ApiError({
            message: 'Project with provided ID does not exist',
            statusCode: 422,
            details: { projectObjId: params.data.projectObjId }
        }));

    // Response
    const response: ApiResponseSuccess<DatasetsDtoType> = {
        success: true,
        data: DatasetsDto.parse(project.datasetObjIds)
    };
    return res.status(200).json(response);
}

export async function updateDataset(req: Request, res: Response, next: NextFunction) {
    // Validation
    const params = DatasetPathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
        }));
    const datasetUpdateParse = DatasetUpdateDto.safeParse(req.body);
    if (!datasetUpdateParse.success)
        return next(new ApiError({
            message: 'Malformed dataset update fields',
            statusCode: 422,
            details: datasetUpdateParse.error.issues
        }));
    if (Object.keys(datasetUpdateParse.data).length === 0)
        return next(new ApiError({
            message: 'No update was performed as no update fields were specified',
            statusCode: 400
        }));

    // User update
    const updatedDataset: IDataset | null = await Dataset.findOneAndUpdate(
            { _id: params.data.datasetObjId },
            { $set: datasetUpdateParse.data },
            { returnDocument: 'after', runValidators: true }
        );
    if (!updatedDataset)
        return next(new ApiError({
            message: 'Dataset with provided ID does not exist',
            statusCode: 422,
            details: { datasetObjId: params.data.datasetObjId }
        }));

    // Response
    const response: ApiResponseSuccess<DatasetDtoType> = {
        success: true,
        data: DatasetDto.parse(updatedDataset)
    };
    res.status(200).json(response);
}

export function ingestData(_req: Request, res: Response, _next: NextFunction) {
    res.status(500).json({
        'message': 'NOT IMPLEMENTED'
    });
}

export async function deleteDataset(req: Request, res: Response, next: NextFunction) {
    // Validation
    const params = DatasetPathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
        }));

    // Dataset deletion + removal of references
    const updatedProject = await Project.findOneAndUpdate(
        { _id: params.data.projectObjId },
        { $pull: { datasetObjIds: params.data.datasetObjId } }
    );
    if (!updatedProject)
        return next(new ApiError({
            message: 'Project with provided ID does not exist',
            statusCode: 422,
            details: {
                datasetObjId: params.data.datasetObjId,
            }
        }));
    const datasetDeleteResult = await Dataset.deleteOne({ _id: params.data.datasetObjId });
    if (!datasetDeleteResult.acknowledged || datasetDeleteResult.deletedCount === 0)
        return next(new ApiError({
            message: 'Dataset with provided ID does not exist',
            statusCode: 422,
            details: {
                datasetObjId: params.data.datasetObjId,
            }
        }));
    await Query.updateMany(
        { baseDatasetObjId: params.data.datasetObjId },
        { $unset: { baseDatasetObjId: '' } }
    );

    // Response
    const response: ApiResponseSuccess<any> = {
        success: true,
        data: {}
    };
    return res.status(200).json(response);
}
