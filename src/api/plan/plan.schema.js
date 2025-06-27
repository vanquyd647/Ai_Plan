exports.getPlans = {
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            title: { type: 'string' },
                            description: { type: 'string' },
                        },
                    },
                },
            },
        },
    },
};

exports.createPlan = {
    body: {
        type: 'object',
        required: ['input'], // Chỉ yêu cầu input, title sẽ được tạo tự động
        properties: {
            input: { type: 'string', minLength: 1 },
            title: { type: 'string', minLength: 1 }, // Optional
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                rawResponse: { type: 'string' }, // Thêm để debug
                data: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        objective: { type: 'string' },
                        steps: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    description: { type: 'string' },
                                    timeline: { type: 'string' },
                                    resources: { type: 'string' },
                                },
                            },
                        },
                        risks: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    risk: { type: 'string' },
                                    mitigation: { type: 'string' },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};


