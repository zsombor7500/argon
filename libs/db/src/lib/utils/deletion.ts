import { Types } from 'mongoose';

import {
    User,
    Query,
    Invite,
    Project,
    Dataset,
    Tag
} from '#/db/models';
import type { IInvite, IProject } from '#/db/interfaces';
import { userContentDbConnection } from '../connections/userContent.connection.js';


export async function deleteInvites(inviteObjIds: Types.ObjectId[]): Promise<void> {
    const invites: IInvite[] = await Invite.find({ _id: { $in: inviteObjIds } });
    if (invites.length === 0)
        throw new Error('No invites were found with provided ObjectIds');
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
        throw new Error('User updates weren\'t acknowledged');
    // Delete invites from projects
    const projectUpdateResult = await Project.updateMany(
        { _id: { $in: [...projectObjIds] } },
        { $pullAll: { inviteObjIds: inviteObjIds } }
    );
    if (!projectUpdateResult.acknowledged)
        throw new Error('Project updates weren\'t acknowledged');
    // Delete invites
    const inviteDeleteResult = await Invite.deleteMany({ _id: { $in: inviteObjIds } });
    if (!inviteDeleteResult.acknowledged)
        throw new Error('Invite deletions weren\'t acknowledged');
}

export async function deleteProject(projectObjId: Types.ObjectId): Promise<void> {
    const project: IProject | null = await Project.findOneAndDelete({ _id: projectObjId });
    if (!project)
        throw new Error('No project was found with provided ObjectId');
    // Remove project references
    const userUpdateResult = await User.updateMany(
        { _id: { $in: project.userObjIds } },
        { $pull: { projectObjIds: project._id } }
    );
    if (!userUpdateResult.acknowledged)
        throw new Error('Project updates weren\'t acknowledged');
    // Delete datasets + queries + tags
    const queryDeleteResult = await Query.deleteMany({ _id: { $in: project.queryObjIds } });
    if (!queryDeleteResult.acknowledged)
        throw new Error('Query deletions weren\'t acknowledged');
    const datasets = await Dataset.find({ _id: { $in: project.datasetObjIds } });
    for (const dataset of datasets)
        await userContentDbConnection.dropCollection(dataset.collectionRef);
    const datasetDeleteResult = await Dataset.deleteMany({ _id: { $in: project.datasetObjIds } });
    if (!datasetDeleteResult.acknowledged)
        throw new Error('Dataset deletions weren\'t acknowledged');
    const tagDeleteResult = await Tag.deleteMany({ _id: { $in: project.tagObjIds } });
    if (!tagDeleteResult.acknowledged)
        throw new Error('Tag deletions weren\'t acknowledged');
    // Delete invites
    if (project.inviteObjIds.length !== 0)
        await deleteInvites(project.inviteObjIds);
}

export async function removeUserFromProject(userObjId: Types.ObjectId, project: IProject): Promise<void> {
    if (userObjId.equals(project.ownerObjId)) {
        await deleteProject(project._id);
        return;
    }
    for (const [role, userObjIds] of project.roleToUserObjIdsMap)
        project.roleToUserObjIdsMap.set(role, userObjIds.filter((oid) => !oid.equals(userObjId)));
    project.userObjIds = project.userObjIds.filter((oid) => !oid.equals(userObjId));
    await project.save();
}
