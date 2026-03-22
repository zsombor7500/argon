import type { Request, Response, NextFunction } from 'express';

import {
    ProjectDto,
    ProjectsDto,
    ProjectUpdateDto,
    ProjectCreationDto,
    ProjectPathParamsDto
} from '#/dto/project';
import { ApiError } from '#/exceptions/api';
import { getJwtBody } from '#/utils/api';
import { User, Project } from '#/db/models';
import { deleteProject as deleteProjectUtil, removeUserFromProject } from '#/utils/db';
import type { ProjectDtoType } from '#/dto/project';
import type { IUser, IProject } from '#/db/interfaces';
import type { ApiResponseSuccess } from '#/dto/api';
import type { IUserProjectPopulated } from '#/db/interfaces';


export async function createProject(req: Request, res: Response, next: NextFunction) {
    // Validation
    const jwtBody = getJwtBody(res);
    const projectCreationParse = ProjectCreationDto.safeParse(req.body);
    if (!projectCreationParse.success)
        return next(new ApiError({
            message: 'Malformed project creation fields',
            statusCode: 422,
            details: projectCreationParse.error.issues
        }));

    // Owner retrieval
    const owner: IUser | null = await User.findOne({ _id: jwtBody.userObjId });
    if (!owner)
        return next(new ApiError({
            message: 'User with provided ID does not exist',
            statusCode: 422,
            details: { userObjId: jwtBody.userObjId }
        }));
    // Project creation
    // All errors are passed to the error handling middleware, as for errors, there are only code 500 responses
    const newProject: IProject = await Project.create({
        name: projectCreationParse.data.name,
        ownerObjId: owner._id,
        ...(projectCreationParse.data.description !== undefined && { description: projectCreationParse.data.description }),
        userObjIds: [owner._id],
        roleToUserObjIdsMap: {
            'admin': [owner._id],
            'default': []
        },
        roleToScopesMap: {
            'admin': [
                'project:all'
            ],
            'default': [
                'project:read'
            ]
        }
    });
    owner.projectObjIds.push(newProject._id);
    await owner.save();

    // Response
    const response: ApiResponseSuccess<ProjectDtoType> = {
        success: true,
        data: ProjectDto.parse({
            ...newProject.toObject(),
            projectObjId: newProject._id.toString(),
            ownerObjId: owner._id.toString()
        })
    };
    return res.status(200).json(response);
}

export async function getProjects(_req: Request, res: Response, next: NextFunction) {
    // Validation
    const jwtBody = getJwtBody(res);

    // User retrieval
    const userProjectPopulated = await User.findOne({ _id: jwtBody.userObjId })
        .populate<IUserProjectPopulated>('projectObjIds');
    if (!userProjectPopulated)
        return next(new ApiError({
            message: 'User with provided ID does not exist',
            statusCode: 422,
            details: { userObjId: jwtBody.userObjId }
        }));

    // Response
    const response: ApiResponseSuccess<ProjectDtoType[]> = {
        success: true,
        data: ProjectsDto.parse(userProjectPopulated.projectObjIds)
    };
    return res.status(200).json(response);
}

export async function updateProject(req: Request, res: Response, next: NextFunction) {
    // Validation
    const params = ProjectPathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
        }));
    const projectUpdateParse = ProjectUpdateDto.safeParse(req.body);
    if (!projectUpdateParse.success)
        return next(new ApiError({
            message: 'Malformed project update fields',
            statusCode: 422,
            details: projectUpdateParse.error.issues
        }));
    if (Object.keys(projectUpdateParse.data).length === 0)
        return next(new ApiError({
            message: 'No update was performed as no update fields were specified',
            statusCode: 400
        }));

    // User update
    const updatedProject: IProject | null = await Project.findOneAndUpdate(
        { _id: params.data.projectObjId },
        { $set: projectUpdateParse.data },
        { returnDocument: 'after', runValidators: true }
    );
    if (!updatedProject)
        return next(new ApiError({
            message: 'Project with provided ID does not exist',
            statusCode: 422,
            details: { projectObjId: params.data.projectObjId }
        }));

    // Response
    const response: ApiResponseSuccess<ProjectDtoType> = {
        success: true,
        data: ProjectDto.parse(updatedProject)
    };
    res.status(200).json(response);
}

export async function deleteProject(req: Request, res: Response, next: NextFunction) {
    // Validation
    const params = ProjectPathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
        }));

    // Invite + removal from project members
    await deleteProjectUtil(params.data.projectObjId);

    // Response
    const response: ApiResponseSuccess<any> = {
        success: true,
        data: {}
    };
    res.status(200).json(response);
}

export async function disbandProject(req: Request, res: Response, next: NextFunction) {
    // Validation
    const jwtBody = getJwtBody(res);
    const params = ProjectPathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
        }));

    // User removal from projects + its own references
    const updatedProject: IProject | null = await Project.findOne({ _id: params.data.projectObjId });
    if (!updatedProject)
        return next(new ApiError({
            message: 'Project with provided ID does not exist',
            statusCode: 422,
            details: { projectObjId: params.data.projectObjId }
        }));
    const user: IUser | null = await User.findOneAndUpdate(
        { _id: jwtBody.userObjId },
        { $pull: { userObjIds: jwtBody.userObjId } },
        { returnDocument: 'after' }
    );
    if (!user)
        return next(new ApiError({
            message: 'User with provided ID does not exist',
            statusCode: 422,
            details: { projectObjId: params.data.projectObjId }
        }));
    await removeUserFromProject(user._id, updatedProject);

    // Response
    const response: ApiResponseSuccess<any> = {
        success: true,
        data: {}
    };
    res.status(200).json(response);
}

