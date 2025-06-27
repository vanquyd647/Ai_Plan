'use strict';
const AIController = require('./ai.controller');
const AISchema = require('./ai.schema');

async function aiRoutes(fastify, options) {
    // Route để generate plan (không lưu DB)
    fastify.post('/generate-plan', {
        schema: {
            body: {
                type: 'object',
                required: ['input'],
                properties: {
                    input: { type: 'string', minLength: 1 },
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
                                originalInput: { type: 'string' }
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
        schema: AISchema.getAISession
    }, AIController.getAISession);
}

module.exports = aiRoutes;
