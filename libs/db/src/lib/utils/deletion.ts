import { Types } from 'mongoose';

import {
    User,
    Query,
    Invite,
    Project,
    Dataset
} from '#/db/models';
import type { IInvite, IProject } from '#/db/interfaces';


export async function deleteInvites(inviteObjIds: Types.ObjectId[]): Promise<void> {
    const invites: IInvite[] = await Invite.find({ _id: { $in: inviteObjIds } });
    if (!invites)
        throw new Error('No invites were found with provided ObjectIds')
    const userObjIds = new Set(
        invites.flatMap((invite) => [invite.invitantObjId, invite.invitedObjId])
               .map((oid) => oid.toString())
    );
    const projectObjIds = new Set( invites.map((invite) => invite.projectObjId.toString()) );
    // Delete invites from users
    const userUpdateResult = await User.updateMany(
        { _id: { $in: [...userObjIds] } },
        { $pullAll: { inviteObjIds: inviteObjIds } }
    );
    if (!userUpdateResult.acknowledged)
        throw new Error('User updates weren\'t acknowledged')
    // Delete invites from projects
    const projectUpdateResult = await Project.updateMany(
        { _id: { $in: [...projectObjIds] } },
        { $pullAll: { inviteObjIds: inviteObjIds } }
    );
    if (!projectUpdateResult.acknowledged)
        throw new Error('Project updates weren\'t acknowledged')
    // Delete invites
    const inviteDeleteResult = await Invite.deleteMany({ _id: { $in: inviteObjIds } });
    if (!inviteDeleteResult.acknowledged)
        throw new Error('Invite deletions weren\'t acknowledged')
}

export async function deleteProject(projectObjId: Types.ObjectId): Promise<void> {
    const project: IProject | null = await Project.findOneAndDelete({ _id: projectObjId });
    if (!project)
        throw new Error('No project was found with provided ObjectId')
    // Remove project references
    const userUpdateResult = await User.updateMany(
        { _id: { $in: project.userObjIds } },
        { $pull: { projectObjIds: project._id } }
    );
    if (!userUpdateResult.acknowledged)
        throw new Error('Project updates weren\'t acknowledged')
    // Delete datasets + queries
    const queryDeleteResult = await Query.deleteMany({ _id: { $in: project.queryObjIds } });
    if (!queryDeleteResult.acknowledged)
        throw new Error('Query deletions weren\'t acknowledged')
    const datasetDeleteResult = await Dataset.deleteMany({ _id: { $in: project.datasetObjIds } });
    if (!datasetDeleteResult.acknowledged)
        throw new Error('Dataset deletions weren\'t acknowledged')
    // Delete invites
    await deleteInvites(project.inviteObjIds);
}
