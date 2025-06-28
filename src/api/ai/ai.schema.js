exports.generateContent = {
    body: {
        type: 'object',
        required: ['type', 'input'],
        properties: {
            type: { type: 'string', enum: ['writer', 'rewriter', 'planner', 'summary'] },
            input: { type: 'string', minLength: 1 },
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
        400: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                rawResponse: { type: 'string' },
            },
        },
    }
    ,
};

exports.getAISession = {
    params: {
        type: 'object',
        required: ['sessionId'],
        properties: {
            sessionId: { type: 'string' },
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        sessionId: { type: 'string' },
                        content: { type: 'string' },
                        createdAt: { type: 'string' },
                    },
                },
            },
        },
    },
};
