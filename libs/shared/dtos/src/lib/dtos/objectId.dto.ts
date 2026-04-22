import { z } from 'zod';
import { Types } from 'mongoose';

import { OBJECTID_PATTERN } from '#/constants/dtos';


export const ObjectIdToString = z.instanceof(Types.ObjectId).transform((id) => id.toString());
export const ObjectId = z.union([
    z.string().regex(OBJECTID_PATTERN).transform((id) => new Types.ObjectId(id)),
    z.instanceof(Types.ObjectId)
]);

export const ObjectIds = ObjectId.array();
export type ObjectIdsType = z.infer<typeof ObjectIds>;

export const ObjectIdsToString = ObjectId.array();
export type ObjectIdsToStringType = z.infer<typeof ObjectIdsToString>;
