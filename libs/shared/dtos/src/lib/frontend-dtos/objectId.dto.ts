import { z } from 'zod';

import { OBJECTID_PATTERN } from '#/constants/dtos';


export const ObjectId = z.string().regex(OBJECTID_PATTERN);

export const ObjectIds = ObjectId.array();
export type ObjectIdsType = z.infer<typeof ObjectIds>;
