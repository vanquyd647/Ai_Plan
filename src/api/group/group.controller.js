// controllers/group/group.controller.js
const GroupPlanService = require('./group.service');

class GroupPlanController {

    // ✅ Tạo kế hoạch cho nhóm
    async createGroupPlan(request, reply) {
        try {
            const userId = request.user.userId;
            const { groupId } = request.params;
            const planData = request.body;

            const plan = await GroupPlanService.createGroupPlan(groupId, userId, planData);

            return reply.code(201).send({
                success: true,
                message: 'Tạo kế hoạch nhóm thành công',
                data: plan
            });
        } catch (error) {
            console.error('Create group plan error:', error);
            return reply.code(400).send({
                success: false,
                message: error.message || 'Lỗi khi tạo kế hoạch nhóm'
            });
        }
    }

    // ✅ Lấy danh sách kế hoạch nhóm
    async getGroupPlans(request, reply) {
        try {
            const userId = request.user.userId;
            const { groupId } = request.params;
            const options = request.query;

            const result = await GroupPlanService.getGroupPlans(groupId, userId, options);

            return reply.code(200).send({
                success: true,
                message: 'Lấy danh sách kế hoạch thành công',
                data: result.plans,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Get group plans error:', error);
            return reply.code(400).send({
                success: false,
                message: error.message || 'Lỗi khi lấy danh sách kế hoạch'
            });
        }
    }

    // ✅ Phân công nhiệm vụ
    async assignTask(request, reply) {
        try {
            const userId = request.user.userId;
            const { groupId, planId, taskId } = request.params;
            const assignData = request.body;

            const result = await GroupPlanService.assignTask(planId, taskId, userId, assignData);

            return reply.code(200).send({
                success: true,
                message: 'Phân công nhiệm vụ thành công',
                data: result
            });
        } catch (error) {
            console.error('Assign task error:', error);
            return reply.code(400).send({
                success: false,
                message: error.message || 'Lỗi khi phân công nhiệm vụ'
            });
        }
    }

    // ✅ Cập nhật trạng thái nhiệm vụ
    async updateTaskStatus(request, reply) {
        try {
            const userId = request.user.userId;
            const { groupId, planId, taskId } = request.params;
            const { status, comment } = request.body;

            const result = await GroupPlanService.updateTaskStatus(planId, taskId, userId, status, comment);

            return reply.code(200).send({
                success: true,
                message: 'Cập nhật trạng thái thành công',
                data: result
            });
        } catch (error) {
            console.error('Update task status error:', error);
            return reply.code(400).send({
                success: false,
                message: error.message || 'Lỗi khi cập nhật trạng thái'
            });
        }
    }

    // ✅ Lấy nhiệm vụ của tôi
    async getMyTasks(request, reply) {
        try {
            const userId = request.user.userId;
            const { groupId } = request.params;
            const options = request.query;

            const tasks = await GroupPlanService.getUserTasks(groupId, userId, options);

            return reply.code(200).send({
                success: true,
                message: 'Lấy danh sách nhiệm vụ thành công',
                data: tasks
            });
        } catch (error) {
            console.error('Get my tasks error:', error);
            return reply.code(500).send({
                success: false,
                message: error.message || 'Lỗi khi lấy danh sách nhiệm vụ'
            });
        }
    }

    // ✅ Thêm bình luận
    async addTaskComment(request, reply) {
        try {
            const userId = request.user.userId;
            const { groupId, planId, taskId } = request.params;
            const { content } = request.body;

            const result = await GroupPlanService.addTaskComment(planId, taskId, userId, content);

            return reply.code(200).send({
                success: true,
                message: 'Thêm bình luận thành công',
                data: result
            });
        } catch (error) {
            console.error('Add task comment error:', error);
            return reply.code(400).send({
                success: false,
                message: error.message || 'Lỗi khi thêm bình luận'
            });
        }
    }

    // ✅ Lấy thống kê nhóm
    async getGroupStats(request, reply) {
        try {
            const userId = request.user.userId;
            const { groupId } = request.params;

            const stats = await GroupPlanService.getGroupStats(groupId, userId);

            return reply.code(200).send({
                success: true,
                message: 'Lấy thống kê nhóm thành công',
                data: stats
            });
        } catch (error) {
            console.error('Get group stats error:', error);
            return reply.code(500).send({
                success: false,
                message: error.message || 'Lỗi khi lấy thống kê nhóm'
            });
        }
    }

    // ✅ Lấy chi tiết kế hoạch nhóm
    async getGroupPlan(request, reply) {
        try {
            const userId = request.user.userId;
            const { groupId, planId } = request.params;

            const plan = await GroupPlanService.getPlanWithDetails(planId);

            if (!plan) {
                return reply.code(404).send({
                    success: false,
                    message: 'Kế hoạch không tồn tại'
                });
            }

            // Check access permission
            const canView = await GroupPlanService.canUserViewPlan(plan, userId);
            if (!canView) {
                return reply.code(403).send({
                    success: false,
                    message: 'Bạn không có quyền xem kế hoạch này'
                });
            }

            return reply.code(200).send({
                success: true,
                message: 'Lấy chi tiết kế hoạch thành công',
                data: plan
            });
        } catch (error) {
            console.error('Get group plan error:', error);
            return reply.code(500).send({
                success: false,
                message: error.message || 'Lỗi khi lấy chi tiết kế hoạch'
            });
        }
    }

    // ✅ Cập nhật kế hoạch nhóm
    async updateGroupPlan(request, reply) {
        try {
            const userId = request.user.userId;
            const { groupId, planId } = request.params;
            const updateData = request.body;

            const result = await GroupPlanService.updateGroupPlan(planId, userId, updateData);

            return reply.code(200).send({
                success: true,
                message: 'Cập nhật kế hoạch thành công',
                data: result
            });
        } catch (error) {
            console.error('Update group plan error:', error);
            return reply.code(400).send({
                success: false,
                message: error.message || 'Lỗi khi cập nhật kế hoạch'
            });
        }
    }

    // ✅ Xóa kế hoạch nhóm
    async deleteGroupPlan(request, reply) {
        try {
            const userId = request.user.userId;
            const { groupId, planId } = request.params;

            await GroupPlanService.deleteGroupPlan(planId, userId);

            return reply.code(200).send({
                success: true,
                message: 'Xóa kế hoạch thành công'
            });
        } catch (error) {
            console.error('Delete group plan error:', error);
            return reply.code(400).send({
                success: false,
                message: error.message || 'Lỗi khi xóa kế hoạch'
            });
        }
    }
}

module.exports = new GroupPlanController();

