import { SchemaPrimitiveNodeDto } from '#/dto/schema';
import type { SchemaType } from '#/dto/schema';


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
