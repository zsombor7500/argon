// Argon service DB setup
const argonDbName = process.env.MONGO_SERVICE_DB;
if (argonDbName === undefined) {
    print('Missing environment variable `MONGO_SERVICE_DB`');
    process.exit(1);
}

const argonDb = db.getSiblingDB(argonDbName);


// Users
db.createCollection('users', {
    validationLevel: 'strict',
    validationAction: 'error',
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['username', 'displayName', 'email', 'passwordHash', 'projectObjIds', 'inviteObjIds', 'createdAt', 'updatedAt'],
            additionalProperties: true,
            properties: {
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
                }
            }
        }
    }
});

db.users.createIndex(
    { email: 1 },
    { unique: true }
);

print('Users init completed');


// Projects
db.createCollection('projects', {
    validationLevel: 'strict',
    validationAction: 'error',
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'ownerObjId', 'roleToUserObjIdsMap', 'queryObjIds', 'datasetObjIds', 'inviteObjIds', 'createdAt', 'updatedAt'],
            additionalProperties: true,
            properties: {
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
                userObjIds: {
                    bsonType: 'array',
                    minItems: 1,
                    items: { bsonType: 'objectId' },
                    description: 'User ObjectIds - required'
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
                }
            }
        }
    }
});

print('Projects init completed');


// Invites
db.createCollection('invites', {
    validationLevel: 'strict',
    validationAction: 'error',
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'invitantObjId', 'invitedObjId', 'projectObjId', 'createdAt', 'updatedAt'],
            additionalProperties: true,
            properties: {
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
                }
            }
        }
    }
});

db.invites.createIndex(
    { invitedObjId: 1, projectObjId: 1 },
    { unique: true }
);

print('Invites init completed');


// Datasets
db.createCollection('datasets', {
    validationLevel: 'strict',
    validationAction: 'error',
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'collectionRef', 'mongooseSchema', 'createdAt', 'updatedAt'],
            additionalProperties: true,
            properties: {
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
                }
            }
        }
    }
});

print('Datasets init completed');


// Queries
db.createCollection('queries', {
    validationLevel: 'strict',
    validationAction: 'error',
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'baseDatasetObjId', 'query', 'projections', 'createdAt', 'updatedAt'],
            additionalProperties: true,
            properties: {
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
                }
            }
        }
    }
});

print('Queries init completed');


print('Argon database init completed');

