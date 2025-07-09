// services/group/group.service.js
const Plan = require('../../models/Plan');
const Group = require('../../models/Group');
const User = require('../../models/User');
const mongoose = require('mongoose');

class GroupPlanService {
    
    // ✅ Tạo kế hoạch cho nhóm
    async createGroupPlan(groupId, userId, planData) {
        try {
            // Kiểm tra quyền trong nhóm
            const group = await Group.findById(groupId);
            if (!group) {
                throw new Error('Nhóm không tồn tại');
            }
            
            const member = group.members.find(m => 
                m.userId.toString() === userId.toString()
            );
            
            if (!member || !member.permissions.canCreatePlans) {
                throw new Error('Bạn không có quyền tạo kế hoạch trong nhóm này');
            }
            
            const plan = new Plan({
                ...planData,
                userId, // Creator
                groupId,
                collaborators: [{
                    userId,
                    role: 'owner',
                    permissions: {
                        canEdit: true,
                        canAssignTasks: true,
                        canDeleteTasks: true,
                        canInviteOthers: true,
                        canViewReports: true
                    }
                }]
            });
            
            const savedPlan = await plan.save();
            return await this.getPlanWithDetails(savedPlan._id);
            
        } catch (error) {
            throw new Error('Không thể tạo kế hoạch nhóm: ' + error.message);
        }
    }
    
    // ✅ Lấy danh sách kế hoạch nhóm
    async getGroupPlans(groupId, userId, options = {}) {
        try {
            const { page = 1, limit = 10, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = options;
            
            // Kiểm tra quyền truy cập nhóm
            const group = await Group.findById(groupId);
            if (!group) {
                throw new Error('Nhóm không tồn tại');
            }
            
            const isMember = group.members.some(m => 
                m.userId.toString() === userId.toString()
            );
            
            if (!isMember) {
                throw new Error('Bạn không phải thành viên của nhóm này');
            }
            
            // Build query
            const query = { groupId };
            
            if (status) {
                query.status = status;
            }
            
            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }
            
            // Execute query with pagination
            const skip = (page - 1) * limit;
            const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
            
            const plans = await Plan.find(query)
                .populate('userId', 'name email avatar')
                .populate('collaborators.userId', 'name email avatar')
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean();
            
            const total = await Plan.countDocuments(query);
            
            return {
                plans,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
            
        } catch (error) {
            throw new Error('Không thể lấy danh sách kế hoạch: ' + error.message);
        }
    }
    
    // ✅ Phân công nhiệm vụ
    async assignTask(planId, taskId, userId, assignData) {
        try {
            const { assignedUserIds, role = 'collaborator', comment } = assignData;
            
            const plan = await Plan.findById(planId)
                .populate('groupId');
            
            if (!plan) {
                throw new Error('Kế hoạch không tồn tại');
            }
            
            // Check if user has permission to assign tasks
            const canAssign = await this.canUserAssignTasks(plan, userId);
            if (!canAssign) {
                throw new Error('Bạn không có quyền phân công nhiệm vụ');
            }
            
            const task = plan.tasks.id(taskId);
            if (!task) {
                throw new Error('Nhiệm vụ không tồn tại');
            }
            
            // Validate assigned users are group members
            if (plan.groupId) {
                const group = await Group.findById(plan.groupId);
                for (const assignedUserId of assignedUserIds) {
                    const isMember = group.members.some(m => 
                        m.userId.toString() === assignedUserId.toString()
                    );
                    if (!isMember) {
                        const user = await User.findById(assignedUserId);
                        throw new Error(`${user?.name || 'Người dùng'} không thuộc nhóm này`);
                    }
                }
            }
            
            // Add assignments
            for (const assignedUserId of assignedUserIds) {
                const existingAssignment = task.assignedTo.find(a => 
                    a.userId.toString() === assignedUserId.toString()
                );
                
                if (!existingAssignment) {
                    task.assignedTo.push({
                        userId: assignedUserId,
                        assignedBy: userId,
                        role,
                        assignedAt: new Date()
                    });
                }
            }
            
            // Add comment about assignment
            if (comment || assignedUserIds.length > 0) {
                const assignedUsers = await User.find({ _id: { $in: assignedUserIds } });
                const userNames = assignedUsers.map(u => u.name).join(', ');
                
                task.comments.push({
                    userId,
                    content: comment || `Đã phân công nhiệm vụ cho: ${userNames}`,
                    type: 'assignment',
                    createdAt: new Date()
                });
            }
            
            task.updatedAt = new Date();
            await plan.save();
            
            return await this.getPlanWithDetails(planId);
            
        } catch (error) {
            throw new Error('Không thể phân công nhiệm vụ: ' + error.message);
        }
    }
    
    // ✅ Cập nhật trạng thái nhiệm vụ
    async updateTaskStatus(planId, taskId, userId, newStatus, comment) {
        try {
            const plan = await Plan.findById(planId);
            if (!plan) {
                throw new Error('Kế hoạch không tồn tại');
            }
            
            const task = plan.tasks.id(taskId);
            if (!task) {
                throw new Error('Nhiệm vụ không tồn tại');
            }
            
            // Check permission
            const canUpdate = task.assignedTo.some(a => 
                a.userId.toString() === userId.toString()
            ) || await this.canUserEditPlan(plan, userId);
            
            if (!canUpdate) {
                throw new Error('Bạn không có quyền cập nhật nhiệm vụ này');
            }
            
            const oldStatus = task.status;
            task.status = newStatus;
            task.updatedAt = new Date();
            
            // Add status update comment
            if (comment || oldStatus !== newStatus) {
                const statusMap = {
                    'todo': 'Cần làm',
                    'in-progress': 'Đang thực hiện',
                    'review': 'Đang xem xét',
                    'completed': 'Hoàn thành'
                };
                
                task.comments.push({
                    userId,
                    content: comment || `Đã thay đổi trạng thái từ "${statusMap[oldStatus]}" thành "${statusMap[newStatus]}"`,
                    type: 'status-update',
                    createdAt: new Date()
                });
            }
            
            await plan.save();
            return await this.getPlanWithDetails(planId);
            
        } catch (error) {
            throw new Error('Không thể cập nhật trạng thái: ' + error.message);
        }
    }
    
    // ✅ Lấy nhiệm vụ được phân công cho user
    async getUserTasks(groupId, userId, options = {}) {
        try {
            const { status, priority, overdue, sortBy = 'dueDate', page = 1, limit = 20 } = options;
            
            const matchStage = {
                groupId: mongoose.Types.ObjectId(groupId),
                'tasks.assignedTo.userId': mongoose.Types.ObjectId(userId)
            };
            
            const pipeline = [
                { $match: matchStage },
                { $unwind: '$tasks' },
                { 
                    $match: { 
                        'tasks.assignedTo.userId': mongoose.Types.ObjectId(userId) 
                    } 
                }
            ];
            
            // Add filters
            if (status) {
                pipeline.push({ $match: { 'tasks.status': status } });
            }
            
            if (priority) {
                pipeline.push({ $match: { 'tasks.priority': priority } });
            }
            
            if (overdue) {
                pipeline.push({
                    $match: {
                        'tasks.dueDate': { $lt: new Date() },
                        'tasks.status': { $ne: 'completed' }
                    }
                });
            }
            
            // Add sorting
            const sortField = sortBy === 'dueDate' ? 'tasks.dueDate' : `tasks.${sortBy}`;
            pipeline.push({ $sort: { [sortField]: 1 } });
            
            // Add pagination
            pipeline.push(
                { $skip: (page - 1) * limit },
                { $limit: limit }
            );
            
            // Populate references
            pipeline.push(
                {
                    $lookup: {
                        from: 'users',
                        localField: 'tasks.assignedTo.userId',
                        foreignField: '_id',
                        as: 'assignedUsers'
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'tasks.comments.userId',
                        foreignField: '_id',
                        as: 'commentUsers'
                    }
                }
            );
            
            const tasks = await Plan.aggregate(pipeline);
            
            return tasks.map(item => ({
                planId: item._id,
                planTitle: item.title,
                task: {
                    ...item.tasks,
                    assignedUsers: item.assignedUsers,
                    comments: item.tasks.comments?.map(comment => ({
                        ...comment,
                        user: item.commentUsers.find(u => u._id.toString() === comment.userId.toString())
                    }))
                }
            }));
            
        } catch (error) {
            throw new Error('Không thể lấy danh sách nhiệm vụ: ' + error.message);
        }
    }
    
    // ✅ Thêm bình luận vào nhiệm vụ
    async addTaskComment(planId, taskId, userId, content) {
        try {
            const plan = await Plan.findById(planId);
            if (!plan) {
                throw new Error('Kế hoạch không tồn tại');
            }
            
            const task = plan.tasks.id(taskId);
            if (!task) {
                throw new Error('Nhiệm vụ không tồn tại');
            }
            
            // Check if user can comment (assigned to task or has plan access)
            const canComment = task.assignedTo.some(a => 
                a.userId.toString() === userId.toString()
            ) || await this.canUserViewPlan(plan, userId);
            
            if (!canComment) {
                throw new Error('Bạn không có quyền bình luận trên nhiệm vụ này');
            }
            
            task.comments.push({
                userId,
                content,
                type: 'comment',
                createdAt: new Date()
            });
            
            task.updatedAt = new Date();
            await plan.save();
            
            return await this.getPlanWithDetails(planId);
            
        } catch (error) {
            throw new Error('Không thể thêm bình luận: ' + error.message);
        }
    }
    
    // ✅ Lấy thống kê nhóm
    async getGroupStats(groupId, userId) {
        try {
            const group = await Group.findById(groupId);
            if (!group) {
                throw new Error('Nhóm không tồn tại');
            }
            
            // Check member access
            const isMember = group.members.some(m => 
                m.userId.toString() === userId.toString()
            );
            
            if (!isMember) {
                throw new Error('Bạn không phải thành viên của nhóm này');
            }
            
            // Get plan statistics
            const planStats = await Plan.aggregate([
                { $match: { groupId: mongoose.Types.ObjectId(groupId) } },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);
            
            // Get task statistics
            const taskStats = await Plan.aggregate([
                { $match: { groupId: mongoose.Types.ObjectId(groupId) } },
                { $unwind: '$tasks' },
                {
                    $group: {
                        _id: '$tasks.status',
                        count: { $sum: 1 }
                    }
                }
            ]);
            
            // Get member task statistics
            const memberStats = await Plan.aggregate([
                { $match: { groupId: mongoose.Types.ObjectId(groupId) } },
                { $unwind: '$tasks' },
                { $unwind: '$tasks.assignedTo' },
                {
                    $group: {
                        _id: '$tasks.assignedTo.userId',
                        totalTasks: { $sum: 1 },
                        completedTasks: {
                            $sum: { $cond: [{ $eq: ['$tasks.status', 'completed'] }, 1, 0] }
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                }
            ]);
            
            return {
                group: {
                    id: group._id,
                    name: group.name,
                    memberCount: group.members.length,
                    createdAt: group.createdAt
                },
                plans: {
                    total: planStats.reduce((sum, stat) => sum + stat.count, 0),
                    byStatus: planStats.reduce((acc, stat) => {
                        acc[stat._id] = stat.count;
                        return acc;
                    }, {})
                },
                tasks: {
                    total: taskStats.reduce((sum, stat) => sum + stat.count, 0),
                    byStatus: taskStats.reduce((acc, stat) => {
                        acc[stat._id] = stat.count;
                        return acc;
                    }, {})
                },
                members: memberStats.map(stat => ({
                    user: stat.user[0],
                    totalTasks: stat.totalTasks,
                    completedTasks: stat.completedTasks,
                    completionRate: stat.totalTasks > 0 ? 
                        Math.round((stat.completedTasks / stat.totalTasks) * 100) : 0
                }))
            };
            
        } catch (error) {
            throw new Error('Không thể lấy thống kê nhóm: ' + error.message);
        }
    }
    
    // ✅ Helper methods
    async canUserAssignTasks(plan, userId) {
        // Plan owner can always assign
        if (plan.userId.toString() === userId.toString()) {
            return true;
        }
        
        // Check collaborator permissions
        const collaborator = plan.collaborators?.find(c => 
            c.userId.toString() === userId.toString()
        );
        
        return collaborator?.permissions?.canAssignTasks || false;
    }
    
    async canUserEditPlan(plan, userId) {
        if (plan.userId.toString() === userId.toString()) {
            return true;
        }
        
        const collaborator = plan.collaborators?.find(c => 
            c.userId.toString() === userId.toString()
        );
        
        return collaborator?.permissions?.canEdit || false;
    }
    
    async canUserViewPlan(plan, userId) {
        if (plan.userId.toString() === userId.toString()) {
            return true;
        }
        
        const collaborator = plan.collaborators?.find(c => 
            c.userId.toString() === userId.toString()
        );
        
        return !!collaborator;
    }
    
    async getPlanWithDetails(planId) {
        return await Plan.findById(planId)
            .populate('userId', 'name email avatar')
            .populate('groupId', 'name description')
            .populate('collaborators.userId', 'name email avatar')
            .populate('tasks.assignedTo.userId', 'name email avatar')
            .populate('tasks.assignedTo.assignedBy', 'name email avatar')
            .populate('tasks.comments.userId', 'name email avatar')
            .lean();
    }

    async updateGroupPlan(planId, userId, updateData) {
        try {
            const plan = await Plan.findById(planId);
            if (!plan) {
                throw new Error('Kế hoạch không tồn tại');
            }
            
            // Check permission
            const canEdit = await this.canUserEditPlan(plan, userId);
            if (!canEdit) {
                throw new Error('Bạn không có quyền chỉnh sửa kế hoạch này');
            }
            
            // Update plan
            Object.assign(plan, updateData);
            plan.updatedAt = new Date();
            
            await plan.save();
            return await this.getPlanWithDetails(planId);
            
        } catch (error) {
            throw new Error('Không thể cập nhật kế hoạch: ' + error.message);
        }
    }
    
    // ✅ Xóa kế hoạch nhóm
    async deleteGroupPlan(planId, userId) {
        try {
            const plan = await Plan.findById(planId);
            if (!plan) {
                throw new Error('Kế hoạch không tồn tại');
            }
            
            // Only owner can delete
            if (plan.userId.toString() !== userId.toString()) {
                throw new Error('Chỉ người tạo mới có thể xóa kế hoạch');
            }
            
            await Plan.findByIdAndDelete(planId);
            
        } catch (error) {
            throw new Error('Không thể xóa kế hoạch: ' + error.message);
        }
    }
}

module.exports = new GroupPlanService();
