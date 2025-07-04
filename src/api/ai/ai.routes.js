'use strict';
const AIController = require('./ai.controller');
const AISchema = require('./ai.schema');
const { authenticate } = require('../../middleware/auth.middleware');

async function aiRoutes(fastify, options) {
    // Route để generate plan (có xác thực và lưu DB)
    fastify.post('/generate-plan', {
        preHandler: [authenticate], // ✅ Thêm xác thực
        config: {
            rateLimit: {
                max: 20, // Giới hạn 20 requests
                timeWindow: '1 minute'
            }
        },
        schema: {
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
                                id: { type: 'string' }, // ✅ Thêm ID của record
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
                                sessionId: { type: 'string' } // ✅ Thêm session ID
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
            },
        }
    }, AIController.generatePlan);

    // Route để lấy AI session
    fastify.get('/session/:sessionId', {
        preHandler: [authenticate], // ✅ Thêm xác thực
        schema: AISchema.getAISession
    }, AIController.getAISession);

    // ✅ Route mới để lấy lịch sử AI của user
    fastify.get('/history', {
        preHandler: [authenticate],
        schema: {
            querystring: {
                type: 'object',
                properties: {
                    page: { type: 'integer', minimum: 1, default: 1 },
                    limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
                    type: { type: 'string', enum: ['planner', 'writer', 'rewriter', 'summary'] }
                }
            }
        }
    }, AIController.getAIHistory);
}

module.exports = aiRoutes;
