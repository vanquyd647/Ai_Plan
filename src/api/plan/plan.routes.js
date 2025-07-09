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

    // ✅ FIXED: Sử dụng handler hiện có thay vì getAllPlans
    fastify.get('/all', {
        schema: {
            description: 'Lấy tất cả kế hoạch của user (bao gồm cả group plans)',
            tags: ['Plans'],
            security: [{ bearerAuth: [] }],
            querystring: {
                type: 'object',
                properties: {
                    page: { type: 'integer', minimum: 1, default: 1 },
                    limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
                    search: { type: 'string' },
                    category: { type: 'string' },
                    status: { 
                        type: 'string', 
                        enum: ['draft', 'active', 'completed', 'archived'] 
                    },
                    priority: { 
                        type: 'string', 
                        enum: ['low', 'medium', 'high'] 
                    },
                    groupId: { type: 'string' },
                    includeGroups: { 
                        type: 'string', 
                        enum: ['true', 'false'], 
                        default: 'true' 
                    },
                    sortBy: {
                        type: 'string',
                        enum: ['createdAt', 'updatedAt', 'title', 'status', 'priority'],
                        default: 'createdAt'
                    },
                    sortOrder: {
                        type: 'string',
                        enum: ['asc', 'desc'],
                        default: 'desc'
                    }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: {
                            type: 'array',
                            items: PlanSchema.planObject
                        },
                        pagination: PlanSchema.paginationObject
                    }
                },
                500: PlanSchema.errorResponse
            }
        },
        handler: PlanController.getPlans // ✅ Sử dụng handler hiện có
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

    // ✅ NEW ROUTES: Task Management (chỉ thêm khi có handler)
    
    // Add task to plan
    fastify.post('/:planId/tasks', {
        schema: PlanSchema.addTaskToPlan,
        handler: async (request, reply) => {
            // ✅ Temporary handler - sẽ implement sau
            return reply.code(501).send({
                success: false,
                message: 'Task management feature coming soon'
            });
        }
    });

    // Update task in plan
    fastify.put('/:planId/tasks/:taskId', {
        schema: PlanSchema.updateTaskInPlan,
        handler: async (request, reply) => {
            return reply.code(501).send({
                success: false,
                message: 'Task management feature coming soon'
            });
        }
    });

    // Delete task from plan
    fastify.delete('/:planId/tasks/:taskId', {
        schema: PlanSchema.deleteTaskFromPlan,
        handler: async (request, reply) => {
            return reply.code(501).send({
                success: false,
                message: 'Task management feature coming soon'
            });
        }
    });

    // Bulk update tasks
    fastify.put('/:planId/tasks/bulk', {
        schema: PlanSchema.bulkUpdateTasks,
        handler: async (request, reply) => {
            return reply.code(501).send({
                success: false,
                message: 'Task management feature coming soon'
            });
        }
    });

    // ✅ NEW ROUTES: Collaboration Management
    
    // Add collaborator to plan
    fastify.post('/:planId/collaborators', {
        schema: PlanSchema.addCollaboratorToPlan,
        handler: async (request, reply) => {
            return reply.code(501).send({
                success: false,
                message: 'Collaboration feature coming soon'
            });
        }
    });

    // Remove collaborator from plan
    fastify.delete('/:planId/collaborators/:userId', {
        schema: PlanSchema.removeCollaboratorFromPlan,
        handler: async (request, reply) => {
            return reply.code(501).send({
                success: false,
                message: 'Collaboration feature coming soon'
            });
        }
    });

    // Update collaborator permissions
    fastify.put('/:planId/collaborators/:userId', {
        schema: PlanSchema.updateCollaboratorPermissions,
        handler: async (request, reply) => {
            return reply.code(501).send({
                success: false,
                message: 'Collaboration feature coming soon'
            });
        }
    });

    // ✅ NEW ROUTES: Task Assignment
    
    // Assign task to users
    fastify.post('/:planId/tasks/:taskId/assign', {
        schema: PlanSchema.assignTask,
        handler: async (request, reply) => {
            return reply.code(501).send({
                success: false,
                message: 'Task assignment feature coming soon'
            });
        }
    });

    // Add comment to task
    fastify.post('/:planId/tasks/:taskId/comments', {
        schema: PlanSchema.addCommentToTask,
        handler: async (request, reply) => {
            return reply.code(501).send({
                success: false,
                message: 'Task comments feature coming soon'
            });
        }
    });

    // ✅ NEW ROUTES: User Dashboard & My Tasks
    
    // Get user dashboard
    fastify.get('/dashboard', {
        schema: PlanSchema.getUserDashboard,
        handler: async (request, reply) => {
            return reply.code(501).send({
                success: false,
                message: 'Dashboard feature coming soon'
            });
        }
    });

    // Get my assigned tasks
    fastify.get('/my-tasks', {
        schema: PlanSchema.getMyTasks,
        handler: async (request, reply) => {
            return reply.code(501).send({
                success: false,
                message: 'My tasks feature coming soon'
            });
        }
    });
}

module.exports = planRoutes;
