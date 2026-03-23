import type { Request, Response, NextFunction } from 'express';

import {
    InviteDto,
    InvitesDto,
    InviteUpdateDto,
    InviteCreationDto,
    InviteDecisionDto,
    InvitePathParamsDto
} from '#/dto/invite';
import { ApiError } from '#/exceptions/api';
import { getJwtBody } from '#/utils/api';
import { UserPathParamsDto } from '#/dto/user';
import { ProjectPathParamsDto } from '#/dto/project';
import { User, Invite, Project } from '#/db/models';
import { deleteInvites, isDuplicateKeyError } from '#/utils/db';
import type {
    IUser,
    IInvite,
    IProject,
    IUserInvitePopulated,
    IProjectOwnerPopulated,
    IInviteUserAndProjectPopulated
} from '#/db/interfaces';
import type { ApiResponseSuccess } from '#/dto/api';
import type { InviteDtoType, InvitesDtoType } from '#/dto/invite';


export async function createInvite(req: Request, res: Response, next: NextFunction) {
    // Validation (Can skip path param validation)
    const jwtBody = getJwtBody(res);
    const params = ProjectPathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
        }));
    const inviteCreationParse = InviteCreationDto.safeParse(req.body);
    if (!inviteCreationParse.success)
        return next(new ApiError({
            message: 'Malformed invite creation fields',
            statusCode: 422,
            details: inviteCreationParse.error.issues
        }));
    if (inviteCreationParse.data.invitedObjId.equals(jwtBody.userObjId))
        return next(new ApiError({
            message: 'User cannot invite themselves',
            statusCode: 422,
            details: { userObjId: jwtBody.userObjId }
        }));

    // Invitant retrieval
    const invitant: IUser | null = await User.findOne({ _id: jwtBody.userObjId });
    if (!invitant)
        return next(new ApiError({
            message: 'Invitant user with provided ID does not exist',
            statusCode: 422,
            details: { invitantObjId: jwtBody.userObjId }
        }));
    // Invited retrieval
    const invited: IUser | null = await User.findOne({ _id: inviteCreationParse.data.invitedObjId });
    if (!invited)
        return next(new ApiError({
            message: 'Invited user with provided ID does not exist',
            statusCode: 422,
            details: { invitedObjId: inviteCreationParse.data.invitedObjId }
        }));
    if (invited.projectObjIds.includes(params.data.projectObjId))
        return next(new ApiError({
            message: 'Invited user is already a member of the project',
            statusCode: 422,
            details: { invitedObjId: inviteCreationParse.data.invitedObjId }
        }));
    // Project retrieval
    const project: IProject | null = await Project.findOne({ _id: params.data.projectObjId })
        .populate<IProjectOwnerPopulated>('owner');
    if (!project)
        return next(new ApiError({
            message: 'Project with provided ID does not exist',
            statusCode: 422,
            details: { projectObjId: params.data.projectObjId }
        }));
    // Invite creation
    let newInvite: IInvite;
    try {
        newInvite = await Invite.create({
            ...inviteCreationParse.data,
            invitantObjId: jwtBody.userObjId,
            projectObjId: params.data.projectObjId
        })
    } catch (err) {
        // TODO: Fix duplicate error check
        return next(new ApiError({
            message: 'Invite already exists for invited user with specified project',
            statusCode: 422,
            details: err
        }));
    }
    // Add Invite to users and project
    invitant.inviteObjIds.push(newInvite._id);
    await invitant.save();
    invited.inviteObjIds.push(newInvite._id);
    await invited.save();
    project.inviteObjIds.push(newInvite._id);
    await project.save();

    // Response
    const response: ApiResponseSuccess<InviteDtoType> = {
        success: true,
        data: InviteDto.parse({
            ...newInvite.toObject(),
            invitant: invitant,
            invited: invited,
            project: project
        })
    };
    return res.status(200).json(response);
}

export async function getInvites(req: Request, res: Response, next: NextFunction) {
    // Validation
    const jwtBody = getJwtBody(res);
    const params = UserPathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
        }));
    if (!params.data.userObjId.equals(jwtBody.userObjId))
        return next(new ApiError({
            message: 'Forbidden',
            statusCode: 403
        }));

    // User retrieval
    const user = await User.findOne({ _id: jwtBody.userObjId })
        .populate<IUserInvitePopulated>({
            path: 'invites',
            populate: [
                { path: 'invitant' },
                { path: 'invited' },
                {
                    path: 'project',
                    populate: 'owner'
                }
            ]
        });
    if (!user)
        return next(new ApiError({
            message: 'User with provided ID does not exist',
            statusCode: 422,
            details: { userObjId: params.data.userObjId }
        }));

    // Response
    const response: ApiResponseSuccess<InvitesDtoType> = {
        success: true,
        data: InvitesDto.parse(user.invites)
    };
    return res.status(200).json(response);
}

export async function updateInvite(req: Request, res: Response, next: NextFunction) {
    // Validation
    const params = InvitePathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
        }));
    const inviteUpdateParse = InviteUpdateDto.safeParse(req.body);
    if (!inviteUpdateParse.success)
        return next(new ApiError({
            message: 'Malformed invite update fields',
            statusCode: 422,
            details: inviteUpdateParse.error.issues
        }));
    if (Object.keys(inviteUpdateParse.data).length === 0)
        return next(new ApiError({
            message: 'No update was performed as no update fields were specified',
            statusCode: 400
        }));

    // User update
    let updatedInvite: IInvite | null;
    try {
        updatedInvite = await Invite.findOneAndUpdate(
            { _id: params.data.inviteObjId },
            { $set: inviteUpdateParse.data },
            { returnDocument: 'after', runValidators: true }
        ).populate<IInviteUserAndProjectPopulated>([
            { path: 'invitant' },
            { path: 'invited' },
            {
                path: 'project',
                populate: 'owner'
            }
        ]);
    } catch (err) {
        if (isDuplicateKeyError(err))
            return next(new ApiError({
                message: 'Invite already exists for invited user with specified project',
                statusCode: 422,
                details: err
            }));
        return next(err);
    }
    if (!updatedInvite)
        return next(new ApiError({
            message: 'Invite with provided ID does not exist',
            statusCode: 422,
            details: { inviteObjId: params.data.inviteObjId }
        }));

    // Response
    const response: ApiResponseSuccess<InviteDtoType> = {
        success: true,
        data: InviteDto.parse(updatedInvite)
    };
    res.status(200).json(response);
}

export async function acceptRejectInvite(req: Request, res: Response, next: NextFunction) {
    // Validation (Can skip path param validation)
    const jwtBody = getJwtBody(res);
    const params = InvitePathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
        }));
    const inviteDecisionParse = InviteDecisionDto.safeParse(req.body);
    if (!inviteDecisionParse.success)
        return next(new ApiError({
            message: 'Malformed invite decision fields',
            statusCode: 422,
            details: inviteDecisionParse.error.issues
        }));

    // Invite retrieval
    const invite: IInvite | null = await Invite.findOneAndDelete({ invitedObjId: jwtBody.userObjId });
    if (!invite)
        return next(new ApiError({
            message: 'User with provided invite ID has not yet been invited',
            statusCode: 422,
            details: { invitedObjId: jwtBody.userObjId }
        }));
    // Removing invite + adding (or not) the user to the project, and vice-versa
    const userToAdd = inviteDecisionParse.data.accept ? [jwtBody.userObjId] : [];
    const projectToAdd = inviteDecisionParse.data.accept ? [params.data.projectObjId] : [];
    const projectUpdate = await Project.updateOne(
        { _id: invite.projectObjId },
        {
            $pull: { inviteObjIds: invite._id },
            $push: {
                'roleToUserObjIdsMap.default': { $each: userToAdd },
                userObjIds: { $each: userToAdd }
            }
        }
    );
    if (!projectUpdate.acknowledged || projectUpdate.modifiedCount === 0)
        return next(new ApiError({
            details: { projectObjId: params.data.projectObjId }
        }));
    const invitantUpdate = await User.updateOne(
        { _id: invite.invitantObjId },
        { $pull: { inviteObjIds: invite._id } }
    );
    if (!invitantUpdate.acknowledged || invitantUpdate.modifiedCount === 0)
        return next(new ApiError({
            details: { invitantObjId: invite.invitantObjId }
        }));
    const invitedUpdate = await User.updateOne(
        { _id: invite.invitedObjId },
        {
            $pull: { inviteObjIds: invite._id },
            $push: { projectObjIds: { $each: projectToAdd } }
        }
    );
    if (!invitedUpdate.acknowledged || invitedUpdate.modifiedCount === 0)
        return next(new ApiError({
            details: { invitedObjId: invite.invitedObjId }
        }));

    // Response
    const response: ApiResponseSuccess<any> = {
        success: true,
        data: {}
    };
    return res.status(200).json(response);
}

export async function cancelInvite(req: Request, res: Response, next: NextFunction) {
    // Validation
    const params = InvitePathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
        }));

    await deleteInvites([params.data.inviteObjId]);

    // Response
    const response: ApiResponseSuccess<any> = {
        success: true,
        data: {}
    };
    return res.status(200).json(response);
}
