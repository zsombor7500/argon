import { z } from 'zod';
import { Types } from 'mongoose';


export const objectIdToString = z.instanceof(Types.ObjectId).transform((id) => id.toString());
export const objectId = z.union([
    z.string().transform((id) => new Types.ObjectId(id)),
    z.instanceof(Types.ObjectId)
]);

