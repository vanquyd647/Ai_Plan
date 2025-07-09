// routes/group/group.routes.js
'use strict';
const GroupPlanController = require('./group.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const GroupSchema = require('./group.schema');

async function groupPlanRoutes(fastify, options) {
    // Apply authentication middleware
    fastify.addHook('preHandler', authenticate);
    
    // ✅ Group Plans Routes
    
    // Tạo kế hoạch cho nhóm
    fastify.post('/:groupId/plans', {
        schema: {
            description: 'Tạo kế hoạch mới cho nhóm',
            tags: ['Group Plans'],
            security: [{ bearerAuth: [] }],
            params: GroupSchema.groupIdParam,
            body: GroupSchema.createGroupPlanBody,
            response: {
                201: GroupSchema.groupPlanResponse,
                400: GroupSchema.errorResponse
            }
        }
    }, GroupPlanController.createGroupPlan);
    
    // Lấy danh sách kế hoạch nhóm
    fastify.get('/:groupId/plans', {
        schema: {
            description: 'Lấy danh sách kế hoạch của nhóm',
            tags: ['Group Plans'],
            security: [{ bearerAuth: [] }],
            params: GroupSchema.groupIdParam,
            querystring: GroupSchema.getGroupPlansQuery,
            response: {
                200: GroupSchema.groupPlansListResponse,
                400: GroupSchema.errorResponse
            }
        }
    }, GroupPlanController.getGroupPlans);
    
    // Lấy chi tiết kế hoạch nhóm
    fastify.get('/:groupId/plans/:planId', {
        schema: {
            description: 'Lấy chi tiết kế hoạch nhóm',
            tags: ['Group Plans'],
            security: [{ bearerAuth: [] }],
            params: GroupSchema.groupPlanParams,
            response: {
                200: GroupSchema.groupPlanResponse,
                404: GroupSchema.errorResponse,
                403: GroupSchema.errorResponse
            }
        }
    }, GroupPlanController.getGroupPlan);
    
    // Cập nhật kế hoạch nhóm
    fastify.put('/:groupId/plans/:planId', {
        schema: {
            description: 'Cập nhật kế hoạch nhóm',
            tags: ['Group Plans'],
            security: [{ bearerAuth: [] }],
            params: GroupSchema.groupPlanParams,
            body: GroupSchema.updateGroupPlanBody,
            response: {
                200: GroupSchema.groupPlanResponse,
                400: GroupSchema.errorResponse
            }
        }
    }, GroupPlanController.updateGroupPlan);
    
    // Xóa kế hoạch nhóm
    fastify.delete('/:groupId/plans/:planId', {
        schema: {
            description: 'Xóa kế hoạch nhóm',
            tags: ['Group Plans'],
            security: [{ bearerAuth: [] }],
            params: GroupSchema.groupPlanParams,
            response: {
                200: GroupSchema.standardResponse,
                400: GroupSchema.errorResponse
            }
        }
    }, GroupPlanController.deleteGroupPlan);
    
    // ✅ Task Assignment Routes
    
    // Phân công nhiệm vụ
    fastify.post('/:groupId/plans/:planId/tasks/:taskId/assign', {
        schema: {
            description: 'Phân công nhiệm vụ cho thành viên nhóm',
            tags: ['Group Tasks'],
            security: [{ bearerAuth: [] }],
            params: GroupSchema.taskParams,
            body: GroupSchema.assignTaskBody,
            response: {
                200: GroupSchema.groupPlanResponse,
                400: GroupSchema.errorResponse
            }
        }
    }, GroupPlanController.assignTask);
    
    // Cập nhật trạng thái nhiệm vụ
    fastify.put('/:groupId/plans/:planId/tasks/:taskId/status', {
        schema: {
            description: 'Cập nhật trạng thái nhiệm vụ',
            tags: ['Group Tasks'],
            security: [{ bearerAuth: [] }],
            params: GroupSchema.taskParams,
            body: GroupSchema.updateTaskStatusBody,
            response: {
                200: GroupSchema.groupPlanResponse,
                400: GroupSchema.errorResponse
            }
        }
    }, GroupPlanController.updateTaskStatus);
    
    // Thêm bình luận vào nhiệm vụ
    fastify.post('/:groupId/plans/:planId/tasks/:taskId/comments', {
        schema: {
            description: 'Thêm bình luận vào nhiệm vụ',
            tags: ['Group Tasks'],
            security: [{ bearerAuth: [] }],
            params: GroupSchema.taskParams,
            body: GroupSchema.addCommentBody,
            response: {
                200: GroupSchema.groupPlanResponse,
                400: GroupSchema.errorResponse
            }
        }
    }, GroupPlanController.addTaskComment);
    
    // Lấy nhiệm vụ được phân công cho tôi
    fastify.get('/:groupId/my-tasks', {
        schema: {
            description: 'Lấy danh sách nhiệm vụ được phân công cho tôi',
            tags: ['Group Tasks'],
            security: [{ bearerAuth: [] }],
            params: GroupSchema.groupIdParam,
            querystring: GroupSchema.getMyTasksQuery,
            response: {
                200: GroupSchema.myTasksResponse,
                500: GroupSchema.errorResponse
            }
        }
    }, GroupPlanController.getMyTasks);
    
    // ✅ Group Statistics
    
    // Lấy thống kê nhóm
    fastify.get('/:groupId/stats', {
        schema: {
            description: 'Lấy thống kê tổng quan của nhóm',
            tags: ['Group Stats'],
            security: [{ bearerAuth: [] }],
            params: GroupSchema.groupIdParam,
            response: {
                200: GroupSchema.groupStatsResponse,
                500: GroupSchema.errorResponse
            }
        }
    }, GroupPlanController.getGroupStats);
}

module.exports = groupPlanRoutes;
