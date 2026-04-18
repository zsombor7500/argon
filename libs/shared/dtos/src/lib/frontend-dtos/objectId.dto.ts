import { z } from 'zod';


export const ObjectId = z.string();

export const ObjectIds = ObjectId.array();
export type ObjectIdsType = z.infer<typeof ObjectIds>;
