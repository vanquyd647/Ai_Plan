'use strict';
const AIController = require('./ai.controller');
const AISchema = require('./ai.schema');

async function aiRoutes(fastify, options) {
    // Route để generate và tạo plan
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
                        rawResponse: { type: 'string' },
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
            },
        }
    }, AIController.generateAndCreatePlan);

    // Route để lấy AI session
    fastify.get('/session/:sessionId', {
        schema: AISchema.getAISession
    }, AIController.getAISession);
}

module.exports = aiRoutes;
