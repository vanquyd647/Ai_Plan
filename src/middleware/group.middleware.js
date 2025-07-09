// middleware/group.middleware.js
const Group = require('../models/Group');

// ✅ Middleware kiểm tra thành viên nhóm
const checkGroupMembership = async (request, reply) => {
    try {
        const { groupId } = request.params;
        const userId = request.user.userId;

        const group = await Group.findById(groupId);
        if (!group) {
            return reply.code(404).send({
                success: false,
                message: 'Nhóm không tồn tại'
            });
        }

        const isMember = group.members.some(member =>
            member.userId.toString() === userId.toString()
        );

        if (!isMember) {
            return reply.code(403).send({
                success: false,
                message: 'Bạn không phải thành viên của nhóm này'
            });
        }

        // Attach group info to request
        request.group = group;
        request.userMembership = group.members.find(member =>
            member.userId.toString() === userId.toString()
        );

    } catch (error) {
        console.error('Group membership check error:', error);
        return reply.code(500).send({
            success: false,
            message: 'Lỗi kiểm tra quyền thành viên nhóm'
        });
    }
};

// ✅ Middleware kiểm tra quyền tạo kế hoạch
const checkCreatePlanPermission = async (request, reply) => {
    try {
        const userMembership = request.userMembership;

        if (!userMembership.permissions.canCreatePlans) {
            return reply.code(403).send({
                success: false,
                message: 'Bạn không có quyền tạo kế hoạch trong nhóm này'
            });
        }

    } catch (error) {
        console.error('Create plan permission check error:', error);
        return reply.code(500).send({
            success: false,
            message: 'Lỗi kiểm tra quyền tạo kế hoạch'
        });
    }
};

// ✅ Middleware kiểm tra quyền quản lý nhóm
const checkGroupAdminPermission = async (request, reply) => {
    try {
        const userMembership = request.userMembership;

        if (!['owner', 'admin'].includes(userMembership.role)) {
            return reply.code(403).send({
                success: false,
                message: 'Bạn không có quyền quản lý nhóm này'
            });
        }

    } catch (error) {
        console.error('Group admin permission check error:', error);
        return reply.code(500).send({
            success: false,
            message: 'Lỗi kiểm tra quyền quản lý nhóm'
        });
    }
};

module.exports = {
    checkGroupMembership,
    checkCreatePlanPermission,
    checkGroupAdminPermission
};

