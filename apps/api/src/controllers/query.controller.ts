import type { Request, Response, NextFunction } from 'express';

import {
    QueryDto,
    QueriesDto,
    QueryUpdateDto,
    QueryCreationDto,
    QueryPathParamsDto
} from '#/dto/query';
import { ApiError } from '#/exceptions/api';
import { ProjectPathParamsDto } from '#/dto/project';
import { Query, Dataset, Project} from '#/db/models';
import type {
    IQuery,
    IDataset,
    IProject,
    IProjectQueryPopulated,
    IQueryDatasetPopulated
} from '#/db/interfaces';
import type { ApiResponseSuccess } from '#/dto/api';
import type { QueriesDtoType, QueryDtoType } from '#/dto/query';


export async function createQuery(req: Request, res: Response, next: NextFunction) {
    // Validation
    const params = ProjectPathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
        }));
    const queryCreationParse = QueryCreationDto.safeParse(req.body);
    if (!queryCreationParse.success)
        return next(new ApiError({
            message: 'Malformed query creation fields',
            statusCode: 422,
            details: queryCreationParse.error.issues
        }));

    // Retrieve referenced project + dataset
    const project: IProject | null = await Project.findOne({ _id: params.data.projectObjId });
    if (!project)
        return next(new ApiError({
            message: 'Project with provided ID does not exist',
            statusCode: 422,
            details: { projectObjId: params.data.projectObjId }
        }));
    if (!project.datasetObjIds.includes(queryCreationParse.data.baseDatasetObjId))
        return next(new ApiError({
            message: 'Base dataset with provided ID does not exist within specified project',
            statusCode: 422,
            details: { projectObjId: params.data.projectObjId }
        }));
    const dataset: IDataset | null = await Dataset.findOne({ _id: queryCreationParse.data.baseDatasetObjId });
    if (!dataset)
        return next(new ApiError({
            message: 'Dataset with provided ID does not exist',
            statusCode: 422,
            details: { baseDatasetObjId: queryCreationParse.data.baseDatasetObjId }
        }));
    // Dataset creation
    // All errors are passed to the error handling middleware, as for errors, there are only code 500 responses
    const newQuery: IQuery = await Query.create({
        ...queryCreationParse.data,
        query: { $jsonSchema: null }, //queryCreationParse.data.query
        projections: { $jsonSchema: null } //queryCreationParse.data.projections
    });
    project.queryObjIds.push(newQuery._id);
    await project.save();

    // Response
    const response: ApiResponseSuccess<QueryDtoType> = {
        success: true,
        data: QueryDto.parse(newQuery)
    };
    return res.status(200).json(response);
}

export async function getQueries(req: Request, res: Response, next: NextFunction) {
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
        .populate<IProjectQueryPopulated>({
            path: 'queries',
            populate: 'baseDataset'
        });
    if (!project)
        return next(new ApiError({
            message: 'Project with provided ID does not exist',
            statusCode: 422,
            details: { projectObjId: params.data.projectObjId }
        }));

    // Response
    const response: ApiResponseSuccess<QueriesDtoType> = {
        success: true,
        data: QueriesDto.parse(project.queries)
    };
    return res.status(200).json(response);
}

export function executeQuery(_req: Request, res: Response, _next: NextFunction) {
    res.status(500).json({
        'message': 'NOT IMPLEMENTED'
    });
}

export async function updateQuery(req: Request, res: Response, next: NextFunction) {
    // Validation
    const params = QueryPathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
        }));
    const queryUpdateParse = QueryUpdateDto.safeParse(req.body);
    if (!queryUpdateParse.success)
        return next(new ApiError({
            message: 'Malformed dataset update fields',
            statusCode: 422,
            details: queryUpdateParse.error.issues
        }));
    if (Object.keys(queryUpdateParse.data).length === 0)
        return next(new ApiError({
            message: 'No update was performed as no update fields were specified',
            statusCode: 400
        }));

    // Query ownership check
    const project: IProject | null = await Project.findOne({ _id: params.data.projectObjId });
    if (!project)
        return next(new ApiError({
            details: { projectObjId: params.data.projectObjId }
        }));
    if (!project.queryObjIds.includes(params.data.queryObjId))
        return next(new ApiError({
            message: 'Query with provided ID within provided project does not exist',
            statusCode: 422,
            details: { queryObjId: params.data.queryObjId }
        }));
    // Query update
    const updatedQuery: IQuery | null = await Query.findOneAndUpdate(
        { _id: params.data.queryObjId },
        { $set: queryUpdateParse.data },
        { returnDocument: 'after', runValidators: true }
    ).populate<IQueryDatasetPopulated>('baseDataset');
    if (!updatedQuery)
        return next(new ApiError({
            message: 'Invite with provided ID does not exist',
            statusCode: 422,
            details: { queryObjId: params.data.queryObjId }
        }));

    // Response
    const response: ApiResponseSuccess<QueryDtoType> = {
        success: true,
        data: QueryDto.parse(updatedQuery)
    };
    res.status(200).json(response);
}

export async function deleteQuery(req: Request, res: Response, next: NextFunction) {
    // Validation
    const params = QueryPathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
        }));

    // Query ownership check + removal of references + deletion
    const updatedProject: IProject | null = await Project.findOne({ _id: params.data.projectObjId });
    if (!updatedProject)
        return next(new ApiError({
            details: { projectObjId: params.data.projectObjId }
        }));
    if (!updatedProject.queryObjIds.includes(params.data.queryObjId))
        return next(new ApiError({
            message: 'Query with provided ID does not exist within specified project',
            statusCode: 422,
            details: { queryObjId: params.data.queryObjId }
        }));
    updatedProject.queryObjIds = updatedProject.queryObjIds
        .filter((queryObjId) => !queryObjId.equals(params.data.queryObjId));
    await updatedProject.save();
    const queryDeleteResult = await Query.deleteOne({ _id: params.data.queryObjId });
    if (!queryDeleteResult.acknowledged || queryDeleteResult.deletedCount === 0)
        return next(new ApiError({
            details: { queryObjId: params.data.queryObjId }
        }));

    // Response
    const response: ApiResponseSuccess<any> = {
        success: true,
        data: {}
    };
    return res.status(200).json(response);
}
