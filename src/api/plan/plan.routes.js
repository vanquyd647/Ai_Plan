'use strict';
const PlanController = require('./plan.controller');
const PlanSchema = require('./plan.schema');
const { authenticate } = require('../../middleware/auth.middleware');

async function planRoutes(fastify, options) {
    // ✅ Apply authentication middleware to all routes
    fastify.addHook('preHandler', authenticate);

    // ==================== BASIC PLAN CRUD ====================
    
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

    // ✅ UNIFIED: Create plan (both manual and AI-generated)
    fastify.post('/', {
        schema: PlanSchema.createPlan,
        handler: PlanController.createPlan
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

    // ==================== PLAN MANAGEMENT ====================

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

    // Get plans with groups support
    fastify.get('/groups/all', {
        schema: PlanSchema.getPlansWithGroups,
        handler: PlanController.getPlansWithGroups
    });

    // ==================== TASK MANAGEMENT ====================

    // Add task to plan
    fastify.post('/:planId/tasks', {
        schema: PlanSchema.addTaskToPlan,
        handler: PlanController.addTaskToPlan
    });

    // Update task in plan
    fastify.put('/:planId/tasks/:taskId', {
        schema: PlanSchema.updateTaskInPlan,
        handler: PlanController.updateTaskInPlan
    });

    // Delete task from plan
    fastify.delete('/:planId/tasks/:taskId', {
        schema: PlanSchema.deleteTaskFromPlan,
        handler: PlanController.deleteTaskFromPlan
    });

    // Bulk update tasks
    fastify.put('/:planId/tasks/bulk', {
        schema: PlanSchema.bulkUpdateTasks,
        handler: PlanController.bulkUpdateTasks
    });

    // Toggle task completion
    fastify.patch('/:planId/tasks/:taskId/toggle', {
        schema: PlanSchema.toggleTaskCompletion,
        handler: PlanController.toggleTaskCompletion
    });

    // Update task status
    fastify.patch('/:planId/tasks/:taskId/status', {
        schema: PlanSchema.updateTaskStatus,
        handler: PlanController.updateTaskStatus
    });

    // ==================== COLLABORATION ====================

    // Add collaborator to plan
    fastify.post('/:planId/collaborators', {
        schema: PlanSchema.addCollaboratorToPlan,
        handler: PlanController.addCollaboratorToPlan
    });

    // Remove collaborator from plan
    fastify.delete('/:planId/collaborators/:userId', {
        schema: PlanSchema.removeCollaboratorFromPlan,
        handler: PlanController.removeCollaboratorFromPlan
    });

    // Update collaborator permissions
    fastify.put('/:planId/collaborators/:userId', {
        schema: PlanSchema.updateCollaboratorPermissions,
        handler: PlanController.updateCollaboratorPermissions
    });

    // ==================== ASSIGNMENT & COMMENTS ====================

    // Assign task to users
    fastify.post('/:planId/tasks/:taskId/assign', {
        schema: PlanSchema.assignTask,
        handler: PlanController.assignTask
    });

    // Add comment to task
    fastify.post('/:planId/tasks/:taskId/comments', {
        schema: PlanSchema.addCommentToTask,
        handler: PlanController.addCommentToTask
    });

    // ==================== DASHBOARD & MY TASKS ====================

    // Get user dashboard
    fastify.get('/dashboard/overview', {
        schema: PlanSchema.getUserDashboard,
        handler: PlanController.getUserDashboard
    });

    // Get my assigned tasks
    fastify.get('/tasks/assigned', {
        schema: PlanSchema.getMyTasks,
        handler: PlanController.getMyTasks
    });

    // ==================== ADDITIONAL ROUTES ====================

    // Get plans by category
    fastify.get('/category/:category', {
        schema: PlanSchema.getPlansByCategory,
        handler: async (req, reply) => {
            const { category } = req.params;
            req.query.category = category;
            return PlanController.getPlans(req, reply);
        }
    });

    // Get plans by status
    fastify.get('/status/:status', {
        schema: PlanSchema.getPlansByStatus,
        handler: async (req, reply) => {
            const { status } = req.params;
            req.query.status = status;
            return PlanController.getPlans(req, reply);
        }
    });

    // Get plans by priority
    fastify.get('/priority/:priority', {
        schema: PlanSchema.getPlansByPriority,
        handler: async (req, reply) => {
            const { priority } = req.params;
            req.query.priority = priority;
            return PlanController.getPlans(req, reply);
        }
    });

    // Get AI-generated plans
    fastify.get('/source/ai-generated', {
        schema: PlanSchema.getAIGeneratedPlans,
        handler: async (req, reply) => {
            req.query.source = 'ai-generated';
            return PlanController.getPlans(req, reply);
        }
    });

    // Get manual plans
    fastify.get('/source/manual', {
        schema: PlanSchema.getManualPlans,
        handler: async (req, reply) => {
            req.query.source = 'manual';
            return PlanController.getPlans(req, reply);
        }
    });

    // Search plans
    fastify.get('/search/:query', {
        schema: PlanSchema.searchPlans,
        handler: async (req, reply) => {
            const { query } = req.params;
            req.query.search = query;
            return PlanController.getPlans(req, reply);
        }
    });

    // Get recent plans
    fastify.get('/recent/all', {
        schema: PlanSchema.getRecentPlans,
        handler: async (req, reply) => {
            req.query.sortBy = 'updatedAt';
            req.query.sortOrder = 'desc';
            req.query.limit = req.query.limit || 10;
            return PlanController.getPlans(req, reply);
        }
    });

    // Get archived plans
    fastify.get('/archived/all', {
        schema: PlanSchema.getArchivedPlans,
        handler: async (req, reply) => {
            req.query.status = 'archived';
            return PlanController.getPlans(req, reply);
        }
    });

    // Archive plan
    fastify.patch('/:id/archive', {
        schema: PlanSchema.archivePlan,
        handler: async (req, reply) => {
            req.body = { status: 'archived' };
            return PlanController.updatePlan(req, reply);
        }
    });

    // Restore plan from archive
    fastify.patch('/:id/restore', {
        schema: PlanSchema.restorePlan,
        handler: async (req, reply) => {
            req.body = { status: 'active' };
            return PlanController.updatePlan(req, reply);
        }
    });

    // Mark plan as completed
    fastify.patch('/:id/complete', {
        schema: PlanSchema.completePlan,
        handler: async (req, reply) => {
            req.body = { status: 'completed' };
            return PlanController.updatePlan(req, reply);
        }
    });

    // Activate plan
    fastify.patch('/:id/activate', {
        schema: PlanSchema.activatePlan,
        handler: async (req, reply) => {
            req.body = { status: 'active' };
            return PlanController.updatePlan(req, reply);
        }
    });

    // Get plan progress
    fastify.get('/:id/progress', {
        schema: PlanSchema.getPlanProgress,
        handler: async (req, reply) => {
            try {
                const { id } = req.params;
                const userId = req.user.userId;

                const plan = await require('../plan/plan.service').getPlanById(id, userId);
                
                if (!plan) {
                    return reply.code(404).send({
                        success: false,
                        message: 'Không tìm thấy kế hoạch'
                    });
                }

                const progress = {
                    planId: plan._id,
                    title: plan.title,
                    totalTasks: plan.tasks.length,
                    completedTasks: plan.tasks.filter(task => task.status === 'completed').length,
                    inProgressTasks: plan.tasks.filter(task => task.status === 'in-progress').length,
                    todoTasks: plan.tasks.filter(task => task.status === 'todo').length,
                    percentage: plan.tasks.length > 0 
                        ? Math.round((plan.tasks.filter(task => task.status === 'completed').length / plan.tasks.length) * 100) 
                        : 0,
                    status: plan.status,
                    startDate: plan.startDate,
                    endDate: plan.endDate,
                    updatedAt: plan.updatedAt
                };

                return reply.code(200).send({
                    success: true,
                    data: progress,
                    message: 'Lấy tiến độ kế hoạch thành công'
                });
            } catch (error) {
                console.error('Get plan progress error:', error);
                return reply.code(500).send({
                    success: false,
                    message: error.message || 'Lỗi server khi lấy tiến độ kế hoạch'
                });
            }
        }
    });
}

module.exports = planRoutes;
