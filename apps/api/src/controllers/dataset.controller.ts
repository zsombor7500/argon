import mongoose from 'mongoose';
import type { Request, Response, NextFunction } from 'express';

import {
    DatasetDto,
    DatasetsDto,
    DatasetUpdateDto,
    DatasetCreationDto,
    DatasetPathParamsDto
} from '#/dto/dataset';
import { ApiError } from '#/exceptions/api';
import { SchemaDto } from '#/dto/schema';
import { Dataset, Project } from '#/db/models';
import { ProjectPathParamsDto } from '#/dto/project';
import { userContentDbConnection } from '#/db/connections';
import { uniqueString, isAllowedSchema } from '#/utils/api';
import type {
    IDataset,
    IProject,
    IDatasetPopulated,
    IProjectTagPopulated,
    IProjectDatasetPopulated
} from '#/db/interfaces';
import type { ApiResponseSuccess } from '#/dto/api';
import type { DatasetDtoType, DatasetsDtoType } from '#/dto/dataset';


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
    if (!datasetCreationParse.success || !isAllowedSchema(datasetCreationParse.data.jsonSchema))
        return next(new ApiError({
            message: 'Malformed dataset creation fields',
            statusCode: 422,
            details: !datasetCreationParse.success ?
                datasetCreationParse.error.issues : datasetCreationParse.data.jsonSchema
        }));

    // Retrieve project
    const project = await Project.findOne({ _id: params.data.projectObjId })
        .populate<IProjectTagPopulated>('tags');
    if (!project)
        return next(new ApiError({
            details: { projectObjId: params.data.projectObjId }
        }));
    Object.entries(datasetCreationParse.data.attributePathToTagObjIdsMap)
        .forEach(([path, tagObjIds]) => {
            if (tagObjIds.length !== new Set(tagObjIds.map(id => id.toString())).size)
                throw new ApiError({
                    message: 'Malformed dataset creation fields',
                    statusCode: 422,
                    details: { message: 'List of tag ObjectIds contained duplicates' }
                });
            const attribute = datasetCreationParse.data.jsonSchema.properties[path];
            if (!attribute)
                throw new ApiError({
                    message: 'Malformed dataset creation fields',
                    statusCode: 422,
                    details: {
                        jsonSchema: datasetCreationParse.data.jsonSchema,
                        nonExistentAttribute: path
                    }
                });
            if ('oneOf' in attribute)
                throw new ApiError({
                    message: 'Malformed dataset creation fields',
                    statusCode: 422,
                    details: { message: 'oneOf handling has not yet been implemented' }
                });
            tagObjIds.forEach((tagObjId) => {
                const tag = project.tags.find((t) => t._id.equals(tagObjId));
                if (!tag)
                    throw new ApiError({
                        message: 'Malformed dataset creation fields',
                        statusCode: 422,
                        details: { nonExistentTag: tagObjId.toString() }
                    });
                if (tag.type !== attribute.bsonType)
                    throw new ApiError({
                        message: 'Malformed dataset creation fields',
                        statusCode: 422,
                        details: {
                            tagType: tag.type,
                            attributeType: attribute.bsonType
                        }
                    });
            });
        });
    // Dataset collection creation
    const collectionName = uniqueString();
    const collectionSchema = new mongoose.Schema(datasetCreationParse.data.jsonSchema);
    const collection = userContentDbConnection.model(collectionName, collectionSchema);
    await collection.createCollection();
    // Dataset creation
    // All errors are passed to the error handling middleware, as for errors, there are only code 500 responses
    const newDataset: IDataset = await Dataset.create({
        ...datasetCreationParse.data,
        collectionRef: collectionName
    });
    project.datasetObjIds.push(newDataset._id);
    await project.save()

    // Response
    const newDatasetPopulated = await newDataset.populate<IDatasetPopulated>('attributePathToTagObjIdsMap.$*');
    const response: ApiResponseSuccess<DatasetDtoType> = {
        success: true,
        data: DatasetDto.parse({
            ...newDatasetPopulated.toObject(),
            attributePathToTagsMap: newDatasetPopulated.attributePathToTagObjIdsMap
        })
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
        .populate('datasets')
        .populate<IProjectDatasetPopulated>({
            path: 'datasets',
            populate: 'attributePathToTagObjIdsMap.$*'
        });
    if (!project)
        return next(new ApiError({
            message: 'Project with provided ID does not exist',
            statusCode: 422,
            details: { projectObjId: params.data.projectObjId }
        }));

    // Response
    const response: ApiResponseSuccess<DatasetsDtoType> = {
        success: true,
        data: DatasetsDto.parse(
            project.datasets
                .map<unknown>((dataset) => {
                    return {
                        ...dataset.toObject(),
                        attributePathToTagsMap: dataset.attributePathToTagObjIdsMap
                    }
                })
        )
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

    // Dataset ownership check
    const project = await Project.findOne({ _id: params.data.projectObjId })
        .populate<IProjectDatasetPopulated>('datasets')
        .populate<IProjectTagPopulated>('tags');
    if (!project)
        return next(new ApiError({
            details: { projectObjId: params.data.projectObjId }
        }));
    const dataset = project.datasets
        .find(d => d._id.equals(params.data.datasetObjId))
    if (!dataset)
        return next(new ApiError({
            message: 'Dataset with provided ID within provided project does not exist',
            statusCode: 422,
            details: { datasetObjId: params.data.datasetObjId }
        }));
    Object.entries(datasetUpdateParse.data.attributePathToTagObjIdsMap)
        .forEach(([path, tagObjIds]) => {
            if (tagObjIds.length !== new Set(tagObjIds.map(id => id.toString())).size)
                throw new ApiError({
                    message: 'Malformed dataset creation fields',
                    statusCode: 422,
                    details: { message: 'List of tag ObjectIds contained duplicates' }
                });
            const jsonSchema = SchemaDto.parse(dataset.jsonSchema);
            const attribute = jsonSchema.properties[path];
            if (!attribute)
                throw new ApiError({
                    message: 'Malformed dataset creation fields',
                    statusCode: 422,
                    details: {
                        jsonSchema: jsonSchema,
                        nonExistentAttribute: path
                    }
                });
            if ('oneOf' in attribute)
                throw new ApiError({
                    message: 'Malformed dataset creation fields',
                    statusCode: 422,
                    details: { message: 'oneOf handling has not yet been implemented' }
                });
            tagObjIds.forEach((tagObjId) => {
                const tag = project.tags.find((t) => t._id.equals(tagObjId));
                if (!tag)
                    throw new ApiError({
                        message: 'Malformed dataset creation fields',
                        statusCode: 422,
                        details: { nonExistentTag: tagObjId.toString() }
                    });
                if (tag.type !== attribute.bsonType)
                    throw new ApiError({
                        message: 'Malformed dataset creation fields',
                        statusCode: 422,
                        details: {
                            tagType: tag.type,
                            attributeType: attribute.bsonType
                        }
                    });
            });
        });
    // Dataset update
    const updatedDataset = await Dataset.findOneAndUpdate(
        { _id: params.data.datasetObjId },
        { $set: datasetUpdateParse.data },
        { returnDocument: 'after', runValidators: true }
    ).populate<IDatasetPopulated>('attributePathToTagObjIdsMap.$*');
    if (!updatedDataset)
        return next(new ApiError({
            message: 'Dataset with provided ID does not exist',
            statusCode: 422,
            details: { datasetObjId: params.data.datasetObjId }
        }));

    // Response
    const response: ApiResponseSuccess<DatasetDtoType> = {
        success: true,
        data: DatasetDto.parse({
            ...updatedDataset.toObject(),
            attributePathToTagsMap: updatedDataset.attributePathToTagObjIdsMap
        })
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
    const updatedProject: IProject | null = await Project.findOne({ _id: params.data.projectObjId });
    if (!updatedProject)
        return next(new ApiError({
            details: { projectObjId: params.data.projectObjId }
        }));
    if (!updatedProject.datasetObjIds.includes(params.data.datasetObjId))
        return next(new ApiError({
            message: 'Dataset with provided ID does not exist within specified project',
            statusCode: 422,
            details: { datasetObjId: params.data.datasetObjId }
        }));
    updatedProject.datasetObjIds = updatedProject.datasetObjIds
        .filter((datasetObjId) => !datasetObjId.equals(params.data.datasetObjId));
    await updatedProject.save();
    const datasetDeleteResult = await Dataset.deleteOne({ _id: params.data.datasetObjId });
    if (!datasetDeleteResult.acknowledged || datasetDeleteResult.deletedCount === 0)
        return next(new ApiError({
            details: { datasetObjId: params.data.datasetObjId }
        }));

    // Response
    const response: ApiResponseSuccess<any> = {
        success: true,
        data: {}
    };
    return res.status(200).json(response);
}
