exports.login = {
    body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                token: { type: 'string' },
            },
        },
        401: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    },
};

exports.register = {
    body: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            name: { type: 'string', minLength: 3 },
        },
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                token: { type: 'string' },
            },
        },
        400: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    },
};
