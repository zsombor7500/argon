const argonDb = db.getSiblingDB('argon');


// Users
db.createCollection('users', {
    validationLevel: 'strict',
    validationAction: 'error',
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['userId', 'userGrn', 'username', 'displayName', 'passwordHash', 'projectObjIds', 'inviteObjIds', 'createdAt', 'updatedAt', 'archivedAt'],
            additionalProperties: true,
            properties: {
                userId: {
                    bsonType: 'binData',
                    description: 'User UUID (subtype 4) - required'
                },
                userGrn: {
                    bsonType: 'string',
                    minLength: 1,
                    description: 'User Global Resource Name - required'
                },
                username: {
                    bsonType: 'string',
                    minLength: 1,
                    description: 'Username - required'
                },
                displayName: {
                    bsonType: 'string',
                    minLength: 1,
                    description: 'Display name - required'
                },
                firstName: {
                    bsonType: 'string',
                    minLength: 1,
                    description: 'First name'
                },
                lastName: {
                    bsonType: 'string',
                    minLength: 1,
                    description: 'Last name'
                },
                email: {
                    bsonType: 'string',
                    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                    description: 'Email'
                },
                passwordHash: {
                    bsonType: 'string',
                    minLength: 1,
                    description: 'Hashed password - required'
                },
                description: {
                    bsonType: 'string',
                    minLength: 1,
                    description: 'User description'
                },
                projectObjIds: {
                    bsonType: 'array',
                    minItems: 0,
                    items: { bsonType: 'objectId' },
                    description: 'Project ObjectIds - required'
                },
                inviteObjIds: {
                    bsonType: 'array',
                    minItems: 0,
                    items: { bsonType: 'objectId' },
                    description: 'Invite ObjectIds - required'
                },
                createdAt: {
                    bsonType: 'date',
                    description: 'Creation timestamp - required'
                },
                updatedAt: {
                    bsonType: 'date',
                    description: 'Update timestamp - required'
                },
                archivedAt: {
                    bsonType: ['date', 'null'],
                    description: 'Archive timestamp - required'
                }
            }
        }
    }
});

db.users.createIndex({ userId: 1 }, { unique: true });

print('Users init completed');


// Projects
db.createCollection('projects', {
    validationLevel: 'strict',
    validationAction: 'error',
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['projectId', 'projectGrn', 'name', 'ownerObjId', 'roleToUserObjIdsMap', 'queryObjIds', 'datasetObjIds', 'inviteObjIds', 'createdAt', 'updatedAt', 'archivedAt'],
            additionalProperties: true,
            properties: {
                projectId: {
                    bsonType: 'binData',
                    description: 'Project UUID (subtype 4) - required'
                },
                projectGrn: {
                    bsonType: 'string',
                    minLength: 1,
                    description: 'Project Global Resource Name - required'
                },
                name: {
                    bsonType: 'string',
                    minLength: 1,
                    description: 'Project name - required'
                },
                ownerObjId: {
                    bsonType: 'objectId',
                    description: 'Project owner User ObjectId - required'
                },
                description: {
                    bsonType: 'string',
                    minLength: 1,
                    description: 'Project description'
                },
                roleToUserObjIdsMap: {
                    bsonType: 'object',
                    additionalProperties: {
                        bsonType: 'array',
                        minItems: 0,
                        items: { bsonType: 'objectId' }
                    },
                    description: 'Map from role name to array of User ObjectIds - required'
                },
                queryObjIds: {
                    bsonType: 'array',
                    minItems: 0,
                    items: { bsonType: 'objectId' },
                    description: 'Query ObjectIds - required'
                },
                datasetObjIds: {
                    bsonType: 'array',
                    minItems: 0,
                    items: { bsonType: 'objectId' },
                    description: 'Dataset ObjectIds - required'
                },
                inviteObjIds: {
                    bsonType: 'array',
                    minItems: 0,
                    items: { bsonType: 'objectId' },
                    description: 'Invite ObjectIds - required'
                },
                createdAt: {
                    bsonType: 'date',
                    description: 'Creation timestamp - required'
                },
                updatedAt: {
                    bsonType: 'date',
                    description: 'Update timestamp - required'
                },
                archivedAt: {
                    bsonType: ['date', 'null'],
                    description: 'Archive timestamp - required'
                }
            }
        }
    }
});

db.projects.createIndex({ projectId: 1 }, { unique: true });

print('Projects init completed');


// Invites
db.createCollection('invites', {
    validationLevel: 'strict',
    validationAction: 'error',
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['inviteId', 'inviteGrn', 'name', 'invitantObjId', 'invitedObjId', 'projectObjId', 'createdAt', 'updatedAt', 'archivedAt'],
            additionalProperties: true,
            properties: {
                inviteId: {
                    bsonType: 'binData',
                    description: 'Invite UUID - required'
                },
                inviteGrn: {
                    bsonType: 'string',
                    minLength: 1,
                    description: 'Invite Global Resource Name - required'
                },
                name: {
                    bsonType: 'string',
                    minLength: 1,
                    description: 'Invite name - required'
                },
                description: {
                    bsonType: 'string',
                    description: 'Invite description'
                },
                invitantObjId: {
                    bsonType: 'objectId',
                    description: 'User who sent the invite - required'
                },
                invitedObjId: {
                    bsonType: 'objectId',
                    description: 'User being invited - required'
                },
                projectObjId: {
                    bsonType: 'objectId',
                    description: 'Project being joined - required'
                },
                createdAt: {
                    bsonType: 'date',
                    description: 'Creation timestamp - required'
                },
                updatedAt: {
                    bsonType: 'date',
                    description: 'Update timestamp - required'
                },
                archivedAt: {
                    bsonType: ['date', 'null'],
                    description: 'Archive timestamp - required'
                }
            }
        }
    }
});

db.invites.createIndex({ inviteId: 1 }, { unique: true });

print('Invites init completed');


// Datasets
db.createCollection('datasets', {
    validationLevel: 'strict',
    validationAction: 'error',
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['datasetId', 'datasetGrn', 'name', 'collectionRef', 'mongooseSchema', 'createdAt', 'updatedAt', 'archivedAt'],
            additionalProperties: true,
            properties: {
                datasetId: {
                    bsonType: 'binData',
                    description: 'Dataset UUID - required'
                },
                datasetGrn: {
                    bsonType: 'string',
                    minLength: 1,
                    description: 'Dataset Global Resource Name - required'
                },
                name: {
                    bsonType: 'string',
                    minLength: 1,
                    description: 'Dataset name - required'
                },
                description: {
                    bsonType: 'string',
                    minLength: 1,
                    description: 'Dataset description'
                },
                collectionRef: {
                    bsonType: 'string',
                    minLength: 1,
                    description: 'Reference to MongoDB collection name - required'
                },
                mongooseSchema: {
                    bsonType: 'object',
                    additionalProperties: true,
                    description: 'Mongoose schema definition - required'
                },
                createdAt: {
                    bsonType: 'date',
                    description: 'Creation timestamp - required'
                },
                updatedAt: {
                    bsonType: 'date',
                    description: 'Update timestamp - required'
                },
                archivedAt: {
                    bsonType: ['date', 'null'],
                    description: 'Archive timestamp - required'
                }
            }
        }
    }
});

db.datasets.createIndex({ datasetId: 1 }, { unique: true });

print('Datasets init completed');


// Queries
db.createCollection('queries', {
    validationLevel: 'strict',
    validationAction: 'error',
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['queryId', 'queryGrn', 'name', 'baseDatasetObjId', 'query', 'projections', 'createdAt', 'updatedAt', 'archivedAt'],
            additionalProperties: true,
            properties: {
                queryId: {
                    bsonType: 'binData',
                    description: 'Query UUID - required'
                },
                queryGrn: {
                    bsonType: 'string',
                    minLength: 1,
                    description: 'Query Global Resource Name - required'
                },
                name: {
                    bsonType: 'string',
                    minLength: 1,
                    description: 'Query name - required'
                },
                description: {
                    bsonType: 'string',
                    minLength: 1,
                    description: 'Query description'
                },
                baseDatasetObjId: {
                    bsonType: 'objectId',
                    description: 'Dataset on which the query is defined - required'
                },
                query: {
                    bsonType: 'object',
                    additionalProperties: true,
                    description: 'Query definition - required'
                },
                projections: {
                    bsonType: 'object',
                    additionalProperties: true,
                    description: 'Projection definition - required'
                },
                createdAt: {
                    bsonType: 'date',
                    description: 'Creation timestamp - required'
                },
                updatedAt: {
                    bsonType: 'date',
                    description: 'Update timestamp - required'
                },
                archivedAt: {
                    bsonType: ['date', 'null'],
                    description: 'Archive timestamp - required'
                }
            }
        }
    }
});

db.queries.createIndex({ queryId: 1 }, { unique: true });

print('Queries init completed');


print('Argon database init completed');

