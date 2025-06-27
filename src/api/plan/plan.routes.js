'use strict';
const PlanController = require('./plan.controller');
const PlanSchema = require('./plan.schema');

async function planRoutes(fastify, options) {
    // Get all plans
    fastify.get('/', {
        schema: PlanSchema.getPlans
    }, PlanController.getPlans);

    // Create plan manually
    fastify.post('/', {
        schema: PlanSchema.createPlan
    }, PlanController.createPlan);

    // Save AI generated plan
    fastify.post('/save-ai-plan', {
        schema: {
            body: {
                type: 'object',
                required: ['planData'],
                properties: {
                    planData: {
                        type: 'object',
                        required: ['title', 'objective'],
                        properties: {
                            title: { type: 'string', minLength: 1 },
                            objective: { type: 'string', minLength: 1 },
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
                            originalInput: { type: 'string' },
                            generatedAt: { type: 'string' }
                        }
                    }
                },
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: { type: 'object' },
                    },
                },
            },
        }
    }, PlanController.savePlan);
}

module.exports = planRoutes;
