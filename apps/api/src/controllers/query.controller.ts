import mongoose from 'mongoose';
import type { Request, Response, NextFunction } from 'express';

import {
    QueryDto,
    QueriesDto,
    QueryUpdateDto,
    QueryCreationDto,
    QueryPathParamsDto,
    QueryResultDto,
    QueryExecutionDto
} from '#/dto/query';
import { ApiError } from '#/exceptions/api';
import { Query, Project } from '#/db/models';
import { ProjectPathParamsDto } from '#/dto/project';
import { nestedMapToRecord, getFilterValidator } from '#/utils/api';
import type {
    IQuery,
    IProject,
    IQueryPopulated,
    IProjectQueryPopulated,
    IProjectDatasetPopulated,
    IProjectTagPopulated
} from '#/db/interfaces';
import type { ApiResponseSuccess } from '#/dto/api';
import type { AttributePath, ObjectIdStr } from '#/types/db';
import type { QueriesDtoType, QueryDtoType, QueryResultDtoType } from '#/dto/query';
import { userContentDbConnection } from '#/db/connections';


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
            message: 'Query data does not fit requirements',
            statusCode: 422,
            details: queryCreationParse.error.issues
        }));
    if (queryCreationParse.data.tagObjIds.length === 0)
        return next(new ApiError({
            message: 'List of tags to query by, must not be empty',
            statusCode: 422,
            details: { message: 'Query definition contained no tags to query by' }
        }));

    // Retrieve referenced project
    const project = await Project.findOne({ _id: params.data.projectObjId })
        .populate<IProjectDatasetPopulated>('datasets')
        .populate<IProjectTagPopulated>('tags');
    if (!project)
        return next(new ApiError({
            details: { projectObjId: params.data.projectObjId }
        }));
    // Tag + dataset existence + ducplicates validation
    const availableTags = new Set(project.tagObjIds.map(id => id.toString()));
    const choosenTags = new Set(queryCreationParse.data.tagObjIds.map(id => id.toString()));
    const availableDatasets = new Set(project.datasetObjIds.map(id => id.toString()));
    const choosenDatasets = new Set(queryCreationParse.data.datasetObjIds.map(id => id.toString()));
    if (!choosenTags.isSubsetOf(availableTags) || !choosenDatasets.isSubsetOf(availableDatasets))
        throw new ApiError({
            message: 'Non-existent tag(s) and/or dataset(s) found',
            statusCode: 404,
            details: {
                nonExistentTags: Array.from(choosenTags.difference(availableTags)),
                nonExistentDatasets: Array.from(choosenDatasets.difference(availableDatasets))
            }
        });
    if (choosenTags.size !== queryCreationParse.data.tagObjIds.length || choosenDatasets.size !== queryCreationParse.data.datasetObjIds.length)
        throw new ApiError({
            message: 'Duplicate(s) found within tag(s) and/or dataset(s)',
            statusCode: 422,
            details: { message: 'Duplicates found within choosen tags and/or datasets definition' }
        });
    // Dataset keys are identical to datasets list validation
    const choosenDatasetsFromMapping = new Set(
        Object.keys(queryCreationParse.data.datasetToTagToAttributePathMap)
    );
    const choosenDatasetsMismatch = choosenDatasets.symmetricDifference(choosenDatasetsFromMapping);
    if (choosenDatasetsMismatch.size !== 0)
        throw new ApiError({
            message: 'Datasets from list and tag to field mappings are not identical',
            statusCode: 422,
            details: { choosenDatasetsMismatch: Array.from(choosenDatasetsMismatch) }
        });
    Object.entries(queryCreationParse.data.datasetToTagToAttributePathMap)
        .forEach(([datasetObjId, tagToAttributePathMap]) => {
            // TagObjId to dataset field type map
            const dataset = project.datasets
                .find(dataset => dataset._id.equals(datasetObjId));
            if (!dataset)
                throw new ApiError({
                    details: { nonExistentDatasetWithPassedCheck: datasetObjId }
                });
            const usedAttributePaths = new Set<AttributePath>();
            const usedTags = new Set<ObjectIdStr>();
            Object.entries(tagToAttributePathMap)
                .forEach(([tagObjId, attributePath]) => {
                    if (usedAttributePaths.has(attributePath))
                        throw new ApiError({
                        message: 'Attribute path reuse within tag to attribute mapping',
                        statusCode: 422,
                        details: { reusedAttributePath: attributePath }
                    });
                    usedAttributePaths.add(attributePath);
                    usedTags.add(tagObjId);
                    // Attribute path tag existence validation
                    const assignedTags = dataset.attributePathToTagObjIdsMap.get(attributePath);
                    if (!assignedTags)
                        throw new ApiError({
                            message: 'Non-existent attribute path within dataset',
                            statusCode: 422,
                            details: { nonExistentAttributePath: attributePath }
                        });
                    if (!assignedTags.map(tag => tag._id.toString()).includes(tagObjId))
                        throw new ApiError({
                            message: 'Dataset attribute path is missing assigned tag',
                            statusCode: 422,
                            details: {
                                datasetObjId: datasetObjId,
                                missingTagObjId: tagObjId
                            }
                        });
                });
            // All tag assignments to dataset attribute match type validation
            const missingTags = usedTags.symmetricDifference(choosenTags);
            if (missingTags.size !== 0)
                throw new ApiError({
                    message: 'Some tags are missing assignment on dataset',
                    statusCode: 422,
                    details: {
                        datasetObjId: datasetObjId,
                        missingTagObjIdAssignments: Array.from(missingTags)
                    }
                });
        });

    // Query creation
    // All errors are passed to the error handling middleware, as for errors, there are only code 500 responses
    const newQuery: IQuery = await Query.create(queryCreationParse.data);
    project.queryObjIds.push(newQuery._id);
    await project.save();

    // Response
    const newQueryPopulated = await newQuery.populate<IQueryPopulated>([
        { path: 'datasets' },
        { path: 'tags' }
    ]);
    const response: ApiResponseSuccess<QueryDtoType> = {
        success: true,
        data: QueryDto.parse(newQueryPopulated)
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

    // Project retrieval
    const project = await Project.findOne({ _id: params.data.projectObjId })
        .populate<IProjectTagPopulated>('tags')
        .populate<IProjectQueryPopulated>({
            path: 'queries',
            populate: [
                { path: 'datasets' },
                { path: 'tags' }
            ]
        });
    if (!project)
        return next(new ApiError({
            message: 'Project not found',
            statusCode: 404,
            details: { projectObjId: params.data.projectObjId }
        }));

    // Response
    const response: ApiResponseSuccess<QueriesDtoType> = {
        success: true,
        data: QueriesDto.parse(project.queries)
    };
    return res.status(200).json(response);
}

export async function executeQuery(req: Request, res: Response, next: NextFunction) {
    // Validation
    const params = QueryPathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
        }));
    const queryExecutionParse = QueryExecutionDto.safeParse(req.body);
    if (!queryExecutionParse.success)
        return next(new ApiError({
            message: 'Query data does not fit requirements',
            statusCode: 422,
            details: queryExecutionParse.error.issues
        }));

    // Project + query retrieval
    const project = await Project.findOne({ _id: params.data.projectObjId });
    if (!project)
        return next(new ApiError({
            details: { projectObjId: params.data.projectObjId }
        }));
    if (!project.queryObjIds.map(id => id.toString()).includes(params.data.queryObjId.toString()))
        return next(new ApiError({
            message: 'Query not found within specified project',
            statusCode: 404,
            details: { projectObjId: params.data.projectObjId }
        }));
    const query = await Query.findOne({ _id: params.data.queryObjId })
        .populate<IQueryPopulated>([
            { path: 'datasets' },
            { path: 'tags' }
        ]);
    if (!query)
        return next(new ApiError({
            details: { missingQueryObjIdPassedCheck: params.data.queryObjId }
        }));
    // Filter validation
    const validator = getFilterValidator(query.tags);
    if (!validator.safeParse(queryExecutionParse.data.filter).success)
        return next(new ApiError({
            message: 'Incorrect query execution filter definition',
            statusCode: 422,
            details: { invalidFilter: queryExecutionParse.data.filter }
        }));
    // Filter + querying datasets
    const results = new Map<string, any[]>();
    for (const [datasetObjId, tagToAttributePathMap] of query.datasetToTagToAttributePathMap) {
        // Filter creation for given dataset's collection
        const datasetFilter = new Map<string, any>();
        for (const [tagObjId, attributePath] of tagToAttributePathMap) {
            const tag = query.tags
                .find(d => d._id.equals(tagObjId));
            if (!tag)
                return next(new ApiError({
                    details: { missingTagObjIdPassedCheck: tagObjId }
                }));
            const attributeValueToMatch = queryExecutionParse.data.filter[tagObjId];
            if (!attributeValueToMatch)
                return next(new ApiError({
                    details: { missingFilterTagObjIdPassedCheck: tagObjId }
                }));
            datasetFilter.set(attributePath, attributeValueToMatch);
        }
        // Model retrieval/instantiation + dataset collection query
        const dataset = query.datasets
            .find(d => d._id.equals(datasetObjId));
        if (!dataset)
            return next(new ApiError({
                details: { missingDatasetObjIdPassedCheck: datasetObjId }
            }));
        let model = userContentDbConnection.models[dataset.collectionRef];
        if (!model) {
            const anySchema = new mongoose.Schema({}, { strict: false });
            model = userContentDbConnection.model(dataset.collectionRef, anySchema, dataset.collectionRef);
        }
        const datasetResults = await model.find(
            Object.fromEntries(datasetFilter)
        ).select('-_id -__v').lean();
        results.set(datasetObjId, datasetResults);
    }

    // Response
    const response: ApiResponseSuccess<QueryResultDtoType> = {
        success: true,
        data: QueryResultDto.parse(results)
    };
    return res.status(200).json(response);
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
            message: 'Query data does not fit requirements',
            statusCode: 422,
            details: queryUpdateParse.error.issues
        }));
    if (Object.keys(queryUpdateParse.data).length === 0)
        return next(new ApiError({
            message: 'No update was performed as no update fields were specified',
            statusCode: 400
        }));

    // Retrieve referenced project + query
    const project = await Project.findOne({ _id: params.data.projectObjId })
        .populate<IProjectDatasetPopulated>('datasets')
        .populate<IProjectQueryPopulated>('queries')
        .populate<IProjectTagPopulated>('tags');
    if (!project)
        return next(new ApiError({
            details: { projectObjId: params.data.projectObjId }
        }));
    const query = project.queries.find(q => q._id.equals(params.data.queryObjId));
    if (!query)
        return next(new ApiError({
            message: 'Query not found',
            statusCode: 404,
            details: { queryObjId: params.data.queryObjId }
        }));
    // Preparing optionals
    const tagObjIds = queryUpdateParse.data.tagObjIds ?? query.tagObjIds;
    if (tagObjIds.length === 0)
        return next(new ApiError({
            message: 'List of tags to query by, must not be empty',
            statusCode: 422,
            details: { message: 'Query definition contained no tags to query by' }
        }));
    const datasetObjIds = queryUpdateParse.data.datasetObjIds ?? query.datasetObjIds;
    const datasetToTagToAttributePathMap = queryUpdateParse.data.datasetToTagToAttributePathMap ??
        nestedMapToRecord(query.datasetToTagToAttributePathMap)
    // Tag + dataset existence + ducplicates validation
    const availableTags = new Set(project.tagObjIds.map(id => id.toString()));
    const choosenTags = new Set(tagObjIds.map(id => id.toString()));
    const availableDatasets = new Set(project.datasetObjIds.map(id => id.toString()));
    const choosenDatasets = new Set(datasetObjIds.map(id => id.toString()));
    if (!choosenTags.isSubsetOf(availableTags) || !choosenDatasets.isSubsetOf(availableDatasets))
        throw new ApiError({
            message: 'Non-existent tag(s) and/or dataset(s) found',
            statusCode: 422,
            details: {
                nonExistentTags: Array.from(choosenTags.difference(availableTags)),
                nonExistentDatasets: Array.from(choosenDatasets.difference(availableDatasets))
            }
        });
    if (choosenTags.size !== tagObjIds.length || choosenDatasets.size !== datasetObjIds.length)
        throw new ApiError({
            message: 'Duplicate(s) found within tag(s) and/or dataset(s)',
            statusCode: 422,
            details: { message: 'Duplicates found within choosen tags and/or datasets definition' }
        });
    // Dataset keys are identical to datasets list validation
    const choosenDatasetsFromMapping = new Set(
        Object.keys(datasetToTagToAttributePathMap)
    );
    const choosenDatasetsMismatch = choosenDatasets.symmetricDifference(choosenDatasetsFromMapping);
    if (choosenDatasetsMismatch.size !== 0)
        throw new ApiError({
            message: 'Datasets from list and tag to field mappings are not identical',
            statusCode: 422,
            details: { choosenDatasetsMismatch: Array.from(choosenDatasetsMismatch) }
        });
    Object.entries(datasetToTagToAttributePathMap)
        .forEach(([datasetObjId, tagToAttributePathMap]) => {
            // TagObjId to dataset field type map
            const dataset = project.datasets
                .find(dataset => dataset._id.equals(datasetObjId));
            if (!dataset)
                throw new ApiError({
                    details: { nonExistentDatasetWithPassedCheck: datasetObjId }
                });
            const usedAttributePaths = new Set<AttributePath>();
            const usedTags = new Set<ObjectIdStr>();
            Object.entries(tagToAttributePathMap)
                .forEach(([tagObjId, attributePath]) => {
                    if (usedAttributePaths.has(attributePath))
                        throw new ApiError({
                        message: 'Attribute path reuse within tag to attribute mapping',
                        statusCode: 422,
                        details: { reusedAttributePath: attributePath }
                    });
                    usedAttributePaths.add(attributePath);
                    usedTags.add(tagObjId);
                    // Attribute path tag existence validation
                    const assignedTags = dataset.attributePathToTagObjIdsMap.get(attributePath);
                    if (!assignedTags)
                        throw new ApiError({
                            message: 'Non-existent attribute path within dataset',
                            statusCode: 422,
                            details: { nonExistentAttributePath: attributePath }
                        });
                    if (!assignedTags.map(tag => tag._id.toString()).includes(tagObjId))
                        throw new ApiError({
                            message: 'Dataset attribute path is missing assigned tag',
                            statusCode: 422,
                            details: {
                                datasetObjId: datasetObjId,
                                missingTagObjId: tagObjId
                            }
                        });
                });
            // All tag assignments to dataset attribute match type validation
            const missingTags = usedTags.symmetricDifference(choosenTags);
            if (missingTags.size !== 0)
                throw new ApiError({
                    message: 'Some tags are missing assignment on dataset',
                    statusCode: 422,
                    details: {
                        datasetObjId: datasetObjId,
                        missingTagObjIdAssignments: Array.from(missingTags)
                    }
                });
        });

    // Query update
    const updatedQuery: IQuery | null = await Query.findOneAndUpdate(
        { _id: params.data.queryObjId },
        { $set: queryUpdateParse.data },
        { returnDocument: 'after', runValidators: true }
    ).populate<IQueryPopulated>([
        { path: 'datasets' },
        { path: 'tags' }
    ]);
    if (!updatedQuery)
        return next(new ApiError({
            details: { queryObjId: params.data.queryObjId }
        }));

    // Response
    const response: ApiResponseSuccess<QueryDtoType> = {
        success: true,
        data: QueryDto.parse(updatedQuery)
    };
    return res.status(200).json(response);
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
            message: 'Query not found within specified project',
            statusCode: 404,
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
