import { z } from 'zod';
import { Types } from 'mongoose';


export const ObjectIdToString = z.instanceof(Types.ObjectId).transform((id) => id.toString());
export const ObjectId = z.union([
    z.string().transform((id) => new Types.ObjectId(id)),
    z.instanceof(Types.ObjectId)
]);

export const ObjectIds = ObjectId.array();
export type ObjectIdsType = z.infer<typeof ObjectIds>;
