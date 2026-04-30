import { z } from 'zod';
import type { ZodObject, ZodType } from 'zod';


import { SchemaPrimitiveNodeDto } from '#/dto/schema';
import type { SchemaPrimitiveType, SchemaType } from '#/dto/schema';
import type { ITag } from '#/db/interfaces';


export const schemaPrimitiveTypeToValidator = new Map<SchemaPrimitiveType, ZodType>([
    ['string', z.string()],
    ['int',    z.int()],
    ['bool',   z.boolean()],
]);

export function isAllowedSchema(schema: SchemaType): boolean {
    const notAllowedProperty = Object.entries(schema.properties).find(([_, definition]) =>
        !SchemaPrimitiveNodeDto.safeParse(definition).success
    );
    if (notAllowedProperty)
        return false;
    if (Object.keys(schema.properties).length === 0)
        return false;
    return true;
}

export function getFilterValidator(tags: ITag[]): ZodObject {
    const validator: Record<string, ZodType> = {};
    tags.forEach(tag => {
        const fieldValidator = schemaPrimitiveTypeToValidator.get(tag.type)
        if (!fieldValidator)
            throw new Error(`Unknown filter field type '${tag.type}'`)
        validator[tag._id.toString()] = fieldValidator;
    })
    return z.object(validator).strict();
}
