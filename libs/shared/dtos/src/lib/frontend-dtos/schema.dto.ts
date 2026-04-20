import { z } from 'zod';

import {
    NAME_MAX_LENGTH,
    NAME_MIN_LENGTH,
    TEXT_NO_SPECIAL
} from '#/constants/dtos';


export const SchemaPrimitiveTypeDto = z.enum(['string', 'int', 'bool']);
export type SchemaPrimitiveType = z.infer<typeof SchemaPrimitiveTypeDto>;

export const SchemaArrayTypeDto = z.enum(['array']);
export type SchemaArrayType = z.infer<typeof SchemaArrayTypeDto>;

export const SchemaObjectTypeDto = z.enum(['object']);
export type SchemaObjectType = z.infer<typeof SchemaObjectTypeDto>;


export interface ISchemaPrimitiveNode {
    bsonType: SchemaPrimitiveType;
}

export interface ISchemaArrayNode {
    bsonType: SchemaArrayType;
    items: ISchemaPrimitiveNode | ISchemaArrayNode | ISchemaObjectNode;
}

export interface ISchemaUnionNode {
    oneOf: (ISchemaPrimitiveNode | ISchemaArrayNode | ISchemaObjectNode)[];
}

export interface ISchemaObjectNode {
    bsonType: SchemaObjectType;
    required: string[];
    properties: Record<string, ISchemaPrimitiveNode | ISchemaArrayNode | ISchemaObjectNode | ISchemaUnionNode>;
}


export const SchemaPrimitiveNodeDto: z.ZodType<ISchemaPrimitiveNode> = z.lazy(() =>
    z.object({
        bsonType: SchemaPrimitiveTypeDto
    })
);

export const SchemaArrayNodeDto: z.ZodType<ISchemaArrayNode> = z.lazy(() =>
    z.object({
        bsonType: SchemaArrayTypeDto,
        items: z.union([SchemaPrimitiveNodeDto, SchemaArrayNodeDto, SchemaObjectNodeDto])
    })
);

export const SchemaUnionNodeDto: z.ZodType<ISchemaUnionNode> = z.lazy(() =>
    z.object({
        oneOf: z.union([SchemaPrimitiveNodeDto, SchemaArrayNodeDto, SchemaObjectNodeDto]).array()
    })
);

export const SchemaObjectNodeDto: z.ZodType<ISchemaObjectNode> = z.lazy(() =>
    z.object({
        bsonType: SchemaObjectTypeDto,
        required: z.string().array(),
        properties: z.record(
            z.string().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH).regex(TEXT_NO_SPECIAL),
            z.union([SchemaPrimitiveNodeDto, SchemaArrayNodeDto, SchemaObjectNodeDto, SchemaUnionNodeDto])
        )
    })
);

export type SchemaType = ISchemaObjectNode;
export const SchemaDto = SchemaObjectNodeDto;
