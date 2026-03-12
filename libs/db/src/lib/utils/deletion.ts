import { Types } from 'mongoose';

import { User, Invite, Project } from '#/db/models';
import type { IInvite } from '#/db/interfaces';


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
    const updatedUsers = await User.updateMany(
        { _id: { $in: [...userObjIds] } },
        { $pullAll: { inviteObjIds: inviteObjIds } }
    );
    if (!updatedUsers.acknowledged)
        throw new Error('User updates weren\'t acknowledged')
    // Delete invites from projects
    const updatedProjects = await Project.updateMany(
        { _id: { $in: [...projectObjIds] } },
        { $pullAll: { inviteObjIds: inviteObjIds } }
    );
    if (!updatedProjects.acknowledged)
        throw new Error('Project updates weren\'t acknowledged')
    // Delete invites
    const inviteDeleteResult = await Invite.deleteMany({ _id: { $in: inviteObjIds } });
    if (!inviteDeleteResult.acknowledged)
        throw new Error('Invite deletions weren\'t acknowledged')
}

//export async function deleteProject(projectObjId: Types.ObjectId): Promise<void> {
//    const invites: IInvite[] = await Invite.find({ _id: { $in: inviteObjIds } });
//    if (!invites)
//        throw new Error('No invites were found with provided ObjectIds')
//}
