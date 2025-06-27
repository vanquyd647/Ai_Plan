'use strict';
const PlanController = require('./plan.controller');
const PlanSchema = require('./plan.schema');

async function planRoutes(fastify, opts) {
    fastify.get('/', { schema: PlanSchema.getPlans }, PlanController.getPlans);
    fastify.post('/', { schema: PlanSchema.createPlan }, PlanController.createPlan);
}

module.exports = (planRoutes);
