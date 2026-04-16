import type { Request, Response, NextFunction } from 'express';

import {
    TagDto,
    TagsDto,
    TagUpdateDto,
    TagCreationDto,
    TagPathParamsDto
} from '#/dto/tag';
import { ApiError } from '#/exceptions/api';
import { ProjectPathParamsDto } from '#/dto/project';
import { Tag, Project, Query, Dataset } from '#/db/models';
import type { ApiResponseSuccess } from '#/dto/api';
import type { TagDtoType, TagsDtoType } from '#/dto/tag';
import type { IProject, IProjectTagPopulated, ITag } from '#/db/interfaces';


export async function createTag(req: Request, res: Response, next: NextFunction) {
    // Validation
    const params = ProjectPathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
        }));
    const tagCreationParse = TagCreationDto.safeParse(req.body);
    if (!tagCreationParse.success)
        return next(new ApiError({
            message: 'Malformed tag creation fields',
            statusCode: 422,
            details: tagCreationParse.error.issues
        }));

    // Retrieve project
    const updatedProject: IProject | null = await Project.findOne({ _id: params.data.projectObjId });
    if (!updatedProject)
        return next(new ApiError({
            details: { projectObjId: params.data.projectObjId }
        }));
    // Tag creation
    // All errors are passed to the error handling middleware, as for errors, there are only code 500 responses
    const newTag: ITag = await Tag.create({
        ...tagCreationParse.data
    });
    updatedProject.tagObjIds.push(newTag._id);
    await updatedProject.save()

    // Response
    const response: ApiResponseSuccess<TagDtoType> = {
        success: true,
        data: TagDto.parse(newTag)
    };
    return res.status(200).json(response);
}

export async function getTags(req: Request, res: Response, next: NextFunction) {
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
        .populate<IProjectTagPopulated>('tags');
    if (!project)
        return next(new ApiError({
            message: 'Project with provided ID does not exist',
            statusCode: 422,
            details: { projectObjId: params.data.projectObjId }
        }));

    // Response
    const response: ApiResponseSuccess<TagsDtoType> = {
        success: true,
        data: TagsDto.parse(project.tags)
    };
    return res.status(200).json(response);
}

export async function updateTag(req: Request, res: Response, next: NextFunction) {
    // Validation
    const params = TagPathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
        }));
    const tagUpdateParse = TagUpdateDto.safeParse(req.body);
    if (!tagUpdateParse.success)
        return next(new ApiError({
            message: 'Malformed tag update fields',
            statusCode: 422,
            details: tagUpdateParse.error.issues
        }));
    if (Object.keys(tagUpdateParse.data).length === 0)
        return next(new ApiError({
            message: 'No update was performed as no update fields were specified',
            statusCode: 400
        }));

    // Tag ownership check
    const project: IProject | null = await Project.findOne({ _id: params.data.projectObjId });
    if (!project)
        return next(new ApiError({
            details: { projectObjId: params.data.projectObjId }
        }));
    if (!project.tagObjIds.includes(params.data.tagObjId))
        return next(new ApiError({
            message: 'Tag with provided ID within provided project does not exist',
            statusCode: 422,
            details: { tagObjId: params.data.tagObjId }
        }));
    // Tag update
    const updatedTag: ITag | null = await Tag.findOneAndUpdate(
        { _id: params.data.tagObjId },
        { $set: tagUpdateParse.data },
        { returnDocument: 'after', runValidators: true }
    );
    if (!updatedTag)
        return next(new ApiError({
            message: 'Tag with provided ID does not exist',
            statusCode: 422,
            details: { tagObjId: params.data.tagObjId }
        }));

    // Response
    const response: ApiResponseSuccess<TagDtoType> = {
        success: true,
        data: TagDto.parse(updatedTag)
    };
    res.status(200).json(response);
}

export async function deleteTag(req: Request, res: Response, next: NextFunction) {
    // Validation
    const params = TagPathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
        }));

    // Reference removals
    const updatedProject: IProject | null = await Project.findOne({ _id: params.data.projectObjId });
    if (!updatedProject)
        return next(new ApiError({
            details: { projectObjId: params.data.projectObjId }
        }));
    if (!updatedProject.tagObjIds.includes(params.data.tagObjId))
        return next(new ApiError({
            message: 'Tag with provided ID does not exist within specified project',
            statusCode: 422,
            details: { tagObjId: params.data.tagObjId }
        }));
    updatedProject.tagObjIds = updatedProject.tagObjIds
        .filter((tagObjId) => !tagObjId.equals(params.data.tagObjId));
    await updatedProject.save();
    await Query.updateMany(
        { _id: { $in: updatedProject.queryObjIds } },
        { $pull: { tagObjIds: params.data.tagObjId } }
    );
    await Dataset.updateMany(
        { _id: { $in: updatedProject.datasetObjIds } },
        { $pull: { 'attributePathToTagObjIdsMap.$*': params.data.tagObjId } }
    );
    const tagDeleteResult = await Tag.deleteOne({ _id: params.data.tagObjId });
    if (!tagDeleteResult.acknowledged || tagDeleteResult.deletedCount === 0)
        return next(new ApiError({
            details: { tagObjId: params.data.tagObjId }
        }));

    // Response
    const response: ApiResponseSuccess<any> = {
        success: true,
        data: {}
    };
    return res.status(200).json(response);
}
