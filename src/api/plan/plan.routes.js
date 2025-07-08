'use strict';
const PlanController = require('./plan.controller');
const PlanSchema = require('./plan.schema');
const { authenticate } = require('../../middleware/auth.middleware');

async function planRoutes(fastify, options) {
    // ✅ Apply authentication middleware to all routes
    fastify.addHook('preHandler', authenticate);

    // Get all plans (user's plans only)
    fastify.get('/', {
        schema: PlanSchema.getPlans,
        handler: PlanController.getPlans
    });

    // Get specific plan by ID
    fastify.get('/:id', {
        schema: PlanSchema.getPlan,
        handler: PlanController.getPlanById
    });

    // Create plan manually
    fastify.post('/', {
        schema: PlanSchema.createPlan,
        handler: PlanController.createPlan
    });

    // Save AI generated plan
    fastify.post('/save-ai-plan', {
        schema: PlanSchema.saveAIGeneratedPlan,
        handler: PlanController.saveAIGeneratedPlan
    });

    // Update existing plan
    fastify.put('/:id', {
        schema: PlanSchema.updatePlan,
        handler: PlanController.updatePlan
    });

    // Delete plan
    fastify.delete('/:id', {
        schema: PlanSchema.deletePlan,
        handler: PlanController.deletePlan
    });

    // Get user's plan statistics
    fastify.get('/stats/overview', {
        schema: PlanSchema.getPlanStats,
        handler: PlanController.getPlanStats
    });

    // Duplicate an existing plan
    fastify.post('/:id/duplicate', {
        schema: PlanSchema.duplicatePlan,
        handler: PlanController.duplicatePlan
    });

    // Share plan (generate share link)
    fastify.post('/:id/share', {
        schema: PlanSchema.sharePlan,
        handler: PlanController.sharePlan
    });

    // Export plan to different formats
    fastify.get('/:id/export', {
        schema: PlanSchema.exportPlan,
        handler: PlanController.exportPlan
    });
}

module.exports = planRoutes;
