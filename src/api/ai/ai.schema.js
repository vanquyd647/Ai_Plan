exports.generateContent = {
    body: {
        type: 'object',
        required: ['type', 'input'],
        properties: {
            type: { type: 'string', enum: ['writer', 'rewriter', 'planner', 'summary'] },
            input: { type: 'string', minLength: 1, maxLength: 2000 },
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
};

// ✅ Schema mới cho generate plan
exports.generatePlan = {
    body: {
        type: 'object',
        required: ['input'],
        properties: {
            input: { type: 'string', minLength: 1, maxLength: 2000 },
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
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
                metadata: {
                    type: 'object',
                    properties: {
                        generatedAt: { type: 'string' },
                        originalInput: { type: 'string' },
                        sessionId: { type: 'string' }
                    }
                }
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
        401: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
        500: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }
};

// ✅ Schema cho get AI session
exports.getAISession = {
    params: {
        type: 'object',
        required: ['sessionId'],
        properties: {
            sessionId: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' } // MongoDB ObjectId pattern
        }
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
                        type: { type: 'string' },
                        prompt: { type: 'string' },
                        response: { type: 'object' },
                        status: { type: 'string' },
                        createdAt: { type: 'string' },
                        metadata: { type: 'object' }
                    }
                }
            }
        },
        404: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        },
        500: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
};

// ✅ Schema cho get AI history
exports.getAIHistory = {
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
            type: { type: 'string', enum: ['planner', 'writer', 'rewriter', 'summary'] }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        interactions: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    _id: { type: 'string' },
                                    type: { type: 'string' },
                                    prompt: { type: 'string' },
                                    parsedResponse: { type: 'object' },
                                    status: { type: 'string' },
                                    createdAt: { type: 'string' },
                                    metadata: { type: 'object' }
                                }
                            }
                        },
                        pagination: {
                            type: 'object',
                            properties: {
                                current: { type: 'integer' },
                                total: { type: 'integer' },
                                count: { type: 'integer' },
                                totalRecords: { type: 'integer' }
                            }
                        }
                    }
                }
            }
        },
        500: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
};
