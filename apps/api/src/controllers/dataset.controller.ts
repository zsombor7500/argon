import mongoose, { Types } from 'mongoose';
import type { Request, Response, NextFunction } from 'express';

import {
    DatasetDto,
    DatasetsDto,
    DatasetUpdateDto,
    DatasetCreationDto,
    DatasetPathParamsDto,
    DatasetBatchUploadDto
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
import type { AttributePath } from '#/types/db';


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
    datasetCreationParse.data.jsonSchema.required = ['field1xd'];
    const collectionSchema = new mongoose.Schema({}, { collection: collectionName });
    const collection = userContentDbConnection.model(collectionName, collectionSchema);
    await collection.createCollection({
        validationLevel: 'strict',
        validationAction: 'error',
        validator: { $jsonSchema: datasetCreationParse.data.jsonSchema }
    });
    // Dataset creation
    // All errors are passed to the error handling middleware, as for errors, there are only code 500 responses
    const newDataset: IDataset = await Dataset.create({
        ...datasetCreationParse.data,
        collectionRef: collectionName
    });
    project.datasetObjIds.push(newDataset._id);
    await project.save();

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
    // Prep of optional attribute path to tag ObjectId mapping
    const originalAttributePathMap: Record<AttributePath, Types.ObjectId[]> = {};
    for (const [attributePath, tags] of dataset.attributePathToTagObjIdsMap)
        originalAttributePathMap[attributePath] = tags.map(tag => tag._id);
    const attributePathToTagObjIdsMap = datasetUpdateParse.data.attributePathToTagObjIdsMap ??
        originalAttributePathMap;
    Object.entries(attributePathToTagObjIdsMap)
        .forEach(([path, tagObjIds]) => {
            if (tagObjIds.length !== new Set(tagObjIds.map(id => id.toString())).size)
                throw new ApiError({
                    message: 'Malformed dataset update fields',
                    statusCode: 422,
                    details: { message: 'List of tag ObjectIds contained duplicates' }
                });
            const jsonSchema = SchemaDto.parse(dataset.jsonSchema);
            const attribute = jsonSchema.properties[path];
            if (!attribute)
                throw new ApiError({
                    message: 'Malformed dataset update fields',
                    statusCode: 422,
                    details: {
                        jsonSchema: jsonSchema,
                        nonExistentAttribute: path
                    }
                });
            if ('oneOf' in attribute)
                throw new ApiError({
                    message: 'Malformed dataset update fields',
                    statusCode: 422,
                    details: { message: 'oneOf handling has not yet been implemented' }
                });
            tagObjIds.forEach((tagObjId) => {
                const tag = project.tags.find((t) => t._id.equals(tagObjId));
                if (!tag)
                    throw new ApiError({
                        message: 'Malformed dataset update fields',
                        statusCode: 422,
                        details: { nonExistentTag: tagObjId.toString() }
                    });
                if (tag.type !== attribute.bsonType)
                    throw new ApiError({
                        message: 'Malformed dataset update fields',
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

export async function ingestData(req: Request, res: Response, next: NextFunction) {
    // Validation
    const params = DatasetPathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
        }));
    const datasetBatchParse = DatasetBatchUploadDto.safeParse(req.body);
    if (!datasetBatchParse.success)
        return next(new ApiError({
            message: 'Malformed dataset batch fields',
            statusCode: 422,
            details: datasetBatchParse.error.issues
        }));

    // Dataset ownership check
    const project = await Project.findOne({ _id: params.data.projectObjId })
        .populate<IProjectDatasetPopulated>('datasets');
    if (!project)
        return next(new ApiError({
            details: { projectObjId: params.data.projectObjId }
        }));
    const dataset = project.datasets
        .find(d => d._id.equals(params.data.datasetObjId));
    if (!dataset)
        return next(new ApiError({
            message: 'Dataset with provided ID within provided project does not exist',
            statusCode: 422,
            details: { datasetObjId: params.data.datasetObjId }
        }));
    // Model retrieval/instantiation + insertion
    let model = mongoose.models[dataset.collectionRef];
    if (!model) {
        const anySchema = new mongoose.Schema({}, { strict: false });
        model = userContentDbConnection.model(dataset.collectionRef, anySchema, dataset.collectionRef);
    }
    try {
        await model.insertMany(datasetBatchParse.data.data);
    } catch (err) {
        return next(new ApiError({
            message: 'Malformed dataset batch',
            statusCode: 422,
            details: err
        }));
    }

    // Response
    const response: ApiResponseSuccess<any> = {
        success: true,
        data: {}
    };
    res.status(200).json(response);
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
    const dataset = await Dataset.findOneAndDelete({ _id: params.data.datasetObjId });
    if (!dataset)
        return next(new ApiError({
            details: { datasetObjId: params.data.datasetObjId }
        }));
    await userContentDbConnection.dropCollection(dataset.collectionRef);

    // Response
    const response: ApiResponseSuccess<any> = {
        success: true,
        data: {}
    };
    return res.status(200).json(response);
}
