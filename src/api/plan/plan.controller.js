const mongoose = require('mongoose');
const PlanService = require('../plan/plan.service');

// ✅ Get all plans for authenticated user
exports.getPlans = async (req, reply) => {
    try {
        const userId = req.user.userId;
        const {
            page = 1,
            limit = 10,
            search,
            category,
            status,
            priority,
            source,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const plans = await PlanService.getUserPlans(userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            search,
            category,
            status,
            priority,
            source,
            sortBy,
            sortOrder
        });

        return reply.code(200).send({
            success: true,
            data: plans.plans,
            pagination: plans.pagination,
            message: 'Lấy danh sách kế hoạch thành công'
        });
    } catch (error) {
        console.error('Get plans error:', error);
        return reply.code(500).send({
            success: false,
            message: error.message || 'Lỗi server khi lấy danh sách kế hoạch'
        });
    }
};

// ✅ UNIFIED: Create plan (both manual and AI-generated)
exports.createPlan = async (req, reply) => {
    try {
        const userId = req.user.userId;
        const planData = req.body;

        // ✅ Validate required fields
        if (!planData.title || planData.title.trim() === '') {
            return reply.code(400).send({
                success: false,
                message: 'Tiêu đề kế hoạch là bắt buộc'
            });
        }

        // ✅ Prepare plan data with user info
        const newPlanData = {
            ...planData,
            userId: userId,
            createdBy: userId,

            // ✅ Handle different plan sources
            source: planData.source || 'manual',

            // ✅ Set default values if not provided
            status: planData.status || 'draft',
            priority: planData.priority || 'medium',
            category: planData.category || 'personal',

            // ✅ Handle tasks array (for AI-generated plans)
            tasks: planData.tasks ? planData.tasks.map(task => ({
                ...task,
                id: task.id || new mongoose.Types.ObjectId().toString(),
                status: task.status || 'todo',
                priority: task.priority || 'medium',
                createdAt: new Date(),
                updatedAt: new Date()
            })) : [],

            // ✅ Handle collaborators
            collaborators: planData.collaborators || [],

            // ✅ Handle AI-specific fields
            aiPrompt: planData.aiPrompt || null,
            aiModel: planData.aiModel || null,
            aiGeneratedAt: planData.source === 'ai-generated' ? (planData.aiGeneratedAt || new Date()) : null,

            // ✅ Set timestamps
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // ✅ Create plan using service
        const createdPlan = await PlanService.createPlan(newPlanData);

        // ✅ Return success response
        return reply.code(201).send({
            success: true,
            data: createdPlan,
            message: planData.source === 'ai-generated'
                ? 'Kế hoạch AI đã được lưu thành công'
                : 'Kế hoạch đã được tạo thành công'
        });

    } catch (error) {
        console.error('Create plan error:', error);
        return reply.code(500).send({
            success: false,
            message: error.message || 'Lỗi server khi tạo kế hoạch'
        });
    }
};

// ✅ Get specific plan by ID
exports.getPlanById = async (req, reply) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const plan = await PlanService.getPlanById(id, userId);

        if (!plan) {
            return reply.code(404).send({
                success: false,
                message: 'Không tìm thấy kế hoạch'
            });
        }

        return reply.code(200).send({
            success: true,
            data: plan,
            message: 'Lấy kế hoạch thành công'
        });
    } catch (error) {
        console.error('Get plan by ID error:', error);
        return reply.code(500).send({
            success: false,
            message: error.message || 'Lỗi server khi lấy kế hoạch'
        });
    }
};

// ✅ Update existing plan
exports.updatePlan = async (req, reply) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const updateData = req.body;

        // ✅ Add updatedAt timestamp
        updateData.updatedAt = new Date();

        const updatedPlan = await PlanService.updatePlan(id, userId, updateData);

        if (!updatedPlan) {
            return reply.code(404).send({
                success: false,
                message: 'Không tìm thấy kế hoạch hoặc bạn không có quyền chỉnh sửa'
            });
        }

        return reply.code(200).send({
            success: true,
            data: updatedPlan,
            message: 'Cập nhật kế hoạch thành công'
        });
    } catch (error) {
        console.error('Update plan error:', error);
        return reply.code(500).send({
            success: false,
            message: error.message || 'Lỗi server khi cập nhật kế hoạch'
        });
    }
};

// ✅ Delete plan
exports.deletePlan = async (req, reply) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const deletedPlan = await PlanService.deletePlan(id, userId);

        if (!deletedPlan) {
            return reply.code(404).send({
                success: false,
                message: 'Không tìm thấy kế hoạch hoặc bạn không có quyền xóa'
            });
        }

        return reply.code(200).send({
            success: true,
            message: 'Xóa kế hoạch thành công'
        });
    } catch (error) {
        console.error('Delete plan error:', error);
        return reply.code(500).send({
            success: false,
            message: error.message || 'Lỗi server khi xóa kế hoạch'
        });
    }
};

// ✅ Get user's plan statistics
exports.getPlanStats = async (req, reply) => {
    try {
        const userId = req.user.userId;
        const stats = await PlanService.getUserPlanStats(userId);

        return reply.code(200).send({
            success: true,
            data: stats,
            message: 'Lấy thống kê kế hoạch thành công'
        });
    } catch (error) {
        console.error('Get plan stats error:', error);
        return reply.code(500).send({
            success: false,
            message: error.message || 'Lỗi server khi lấy thống kê'
        });
    }
};

// ✅ Duplicate an existing plan
exports.duplicatePlan = async (req, reply) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const { title } = req.body;

        const duplicatedPlan = await PlanService.duplicatePlan(id, userId, title);

        if (!duplicatedPlan) {
            return reply.code(404).send({
                success: false,
                message: 'Không tìm thấy kế hoạch để sao chép'
            });
        }

        return reply.code(201).send({
            success: true,
            data: duplicatedPlan,
            message: 'Sao chép kế hoạch thành công'
        });
    } catch (error) {
        console.error('Duplicate plan error:', error);
        return reply.code(500).send({
            success: false,
            message: error.message || 'Lỗi server khi sao chép kế hoạch'
        });
    }
};

// ✅ Share plan (generate share link)
exports.sharePlan = async (req, reply) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const { shareType = 'view', expiresIn } = req.body;

        const shareLink = await PlanService.generateShareLink(id, userId, shareType, expiresIn);

        if (!shareLink) {
            return reply.code(404).send({
                success: false,
                message: 'Không tìm thấy kế hoạch để chia sẻ'
            });
        }

        return reply.code(200).send({
            success: true,
            data: { shareLink },
            message: 'Tạo link chia sẻ thành công'
        });
    } catch (error) {
        console.error('Share plan error:', error);
        return reply.code(500).send({
            success: false,
            message: error.message || 'Lỗi server khi tạo link chia sẻ'
        });
    }
};

// ✅ Export plan to different formats
exports.exportPlan = async (req, reply) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const { format = 'json' } = req.query;

        const exportedData = await PlanService.exportPlan(id, userId, format);

        if (!exportedData) {
            return reply.code(404).send({
                success: false,
                message: 'Không tìm thấy kế hoạch để xuất'
            });
        }

        // ✅ Set appropriate headers based on format
        const contentTypes = {
            json: 'application/json',
            pdf: 'application/pdf',
            csv: 'text/csv',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };

        reply.header('Content-Type', contentTypes[format] || 'application/json');
        reply.header('Content-Disposition', `attachment; filename="plan-${id}.${format}"`);

        return reply.code(200).send(exportedData);
    } catch (error) {
        console.error('Export plan error:', error);
        return reply.code(500).send({
            success: false,
            message: error.message || 'Lỗi server khi xuất kế hoạch'
        });
    }
};

// ✅ TASK MANAGEMENT METHODS

// Add task to plan
exports.addTaskToPlan = async (req, reply) => {
    try {
        const { planId } = req.params;
        const userId = req.user.userId;
        const taskData = req.body;

        const updatedPlan = await PlanService.addTaskToPlan(planId, userId, taskData);

        if (!updatedPlan) {
            return reply.code(404).send({
                success: false,
                message: 'Không tìm thấy kế hoạch hoặc bạn không có quyền thêm task'
            });
        }

        return reply.code(201).send({
            success: true,
            data: updatedPlan,
            message: 'Thêm task thành công'
        });
    } catch (error) {
        console.error('Add task to plan error:', error);
        return reply.code(500).send({
            success: false,
            message: error.message || 'Lỗi server khi thêm task'
        });
    }
};

// Update task in plan
exports.updateTaskInPlan = async (req, reply) => {
    try {
        const { planId, taskId } = req.params;
        const userId = req.user.userId;
        const updateData = req.body;

        const updatedPlan = await PlanService.updateTaskInPlan(planId, taskId, userId, updateData);

        if (!updatedPlan) {
            return reply.code(404).send({
                success: false,
                message: 'Không tìm thấy kế hoạch hoặc task, hoặc bạn không có quyền chỉnh sửa'
            });
        }

        return reply.code(200).send({
            success: true,
            data: updatedPlan,
            message: 'Cập nhật task thành công'
        });
    } catch (error) {
        console.error('Update task in plan error:', error);
        return reply.code(500).send({
            success: false,
            message: error.message || 'Lỗi server khi cập nhật task'
        });
    }
};

// Delete task from plan
exports.deleteTaskFromPlan = async (req, reply) => {
    try {
        const { planId, taskId } = req.params;
        const userId = req.user.userId;

        const updatedPlan = await PlanService.deleteTaskFromPlan(planId, taskId, userId);

        if (!updatedPlan) {
            return reply.code(404).send({
                success: false,
                message: 'Không tìm thấy kế hoạch hoặc task, hoặc bạn không có quyền xóa'
            });
        }

        return reply.code(200).send({
            success: true,
            data: updatedPlan,
            message: 'Xóa task thành công'
        });
    } catch (error) {
        console.error('Delete task from plan error:', error);
        return reply.code(500).send({
            success: false,
            message: error.message || 'Lỗi server khi xóa task'
        });
    }
};

// Bulk update tasks
exports.bulkUpdateTasks = async (req, reply) => {
    try {
        const { planId } = req.params;
        const userId = req.user.userId;
        const { tasks } = req.body;

        if (!Array.isArray(tasks)) {
            return reply.code(400).send({
                success: false,
                message: 'Tasks phải là một mảng'
            });
        }

        const plan = await PlanService.getPlanById(planId, userId);
        if (!plan) {
            return reply.code(404).send({
                success: false,
                message: 'Không tìm thấy kế hoạch'
            });
        }

        // Update multiple tasks
        for (const taskUpdate of tasks) {
            if (taskUpdate.id) {
                await PlanService.updateTaskInPlan(planId, taskUpdate.id, userId, taskUpdate);
            }
        }

        const updatedPlan = await PlanService.getPlanById(planId, userId);

        return reply.code(200).send({
            success: true,
            data: updatedPlan,
            message: 'Cập nhật nhiều task thành công'
        });
    } catch (error) {
        console.error('Bulk update tasks error:', error);
        return reply.code(500).send({
            success: false,
            message: error.message || 'Lỗi server khi cập nhật nhiều task'
        });
    }
};

// ✅ COLLABORATION METHODS

// Add collaborator to plan
exports.addCollaboratorToPlan = async (req, reply) => {
    try {
        const { planId } = req.params;
        const userId = req.user.userId;
        const { collaboratorUserId, role = 'viewer', permissions = ['view'] } = req.body;

        const plan = await PlanService.getPlanById(planId, userId);
        if (!plan) {
            return reply.code(404).send({
                success: false,
                message: 'Không tìm thấy kế hoạch'
            });
        }

        // Check if user is owner or has manage_collaborators permission
        const isOwner = plan.userId.toString() === userId;
        const hasPermission = plan.collaborators.some(collab =>
            collab.userId.toString() === userId &&
            collab.permissions.includes('manage_collaborators')
        );

        if (!isOwner && !hasPermission) {
            return reply.code(403).send({
                success: false,
                message: 'Bạn không có quyền thêm cộng tác viên'
            });
        }

        // Check if user is already a collaborator
        const existingCollaborator = plan.collaborators.find(
            collab => collab.userId.toString() === collaboratorUserId
        );

        if (existingCollaborator) {
            return reply.code(400).send({
                success: false,
                message: 'Người dùng đã là cộng tác viên của kế hoạch này'
            });
        }

        const collaboratorData = {
            userId: collaboratorUserId,
            user: collaboratorUserId,
            role,
            permissions,
            addedAt: new Date(),
            addedBy: userId
        };

        plan.collaborators.push(collaboratorData);
        await plan.save();

        await plan.populate('collaborators.userId', 'name email avatar');

        return reply.code(201).send({
            success: true,
            data: plan,
            message: 'Thêm cộng tác viên thành công'
        });
    } catch (error) {
        console.error('Add collaborator to plan error:', error);
        return reply.code(500).send({
            success: false,
            message: error.message || 'Lỗi server khi thêm cộng tác viên'
        });
    }
};

// Remove collaborator from plan
exports.removeCollaboratorFromPlan = async (req, reply) => {
    try {
        const { planId, userId: collaboratorUserId } = req.params;
        const userId = req.user.userId;

        const plan = await PlanService.getPlanById(planId, userId);
        if (!plan) {
            return reply.code(404).send({
                success: false,
                message: 'Không tìm thấy kế hoạch'
            });
        }

        // Check permissions
        const isOwner = plan.userId.toString() === userId;
        const hasPermission = plan.collaborators.some(collab =>
            collab.userId.toString() === userId &&
            collab.permissions.includes('manage_collaborators')
        );

        if (!isOwner && !hasPermission) {
            return reply.code(403).send({
                success: false,
                message: 'Bạn không có quyền xóa cộng tác viên'
            });
        }

        // Remove collaborator
        plan.collaborators = plan.collaborators.filter(
            collab => collab.userId.toString() !== collaboratorUserId
        );

        await plan.save();

        return reply.code(200).send({
            success: true,
            data: plan,
            message: 'Xóa cộng tác viên thành công'
        });
    } catch (error) {
        console.error('Remove collaborator from plan error:', error);
        return reply.code(500).send({
            success: false,
            message: error.message || 'Lỗi server khi xóa cộng tác viên'
        });
    }
};

// Update collaborator permissions
exports.updateCollaboratorPermissions = async (req, reply) => {
    try {
        const { planId, userId: collaboratorUserId } = req.params;
        const userId = req.user.userId;
        const { role, permissions } = req.body;

        const plan = await PlanService.getPlanById(planId, userId);
        if (!plan) {
            return reply.code(404).send({
                success: false,
                message: 'Không tìm thấy kế hoạch'
            });
        }

        // Check permissions
        const isOwner = plan.userId.toString() === userId;
        if (!isOwner) {
            return reply.code(403).send({
                success: false,
                message: 'Chỉ chủ sở hữu mới có thể cập nhật quyền cộng tác viên'
            });
        }

        // Find and update collaborator
        const collaborator = plan.collaborators.find(
            collab => collab.userId.toString() === collaboratorUserId
        );

        if (!collaborator) {
            return reply.code(404).send({
                success: false,
                message: 'Không tìm thấy cộng tác viên'
            });
        }

        if (role) collaborator.role = role;
        if (permissions) collaborator.permissions = permissions;

        await plan.save();
        await plan.populate('collaborators.userId', 'name email avatar');

        return reply.code(200).send({
            success: true,
            data: plan,
            message: 'Cập nhật quyền cộng tác viên thành công'
        });
    } catch (error) {
        console.error('Update collaborator permissions error:', error);
        return reply.code(500).send({
            success: false,
            message: error.message || 'Lỗi server khi cập nhật quyền cộng tác viên'
        });
    }
};

// ✅ ASSIGNMENT & COMMENTS METHODS

// Assign task to users
exports.assignTask = async (req, reply) => {
    try {
        const { planId, taskId } = req.params;
        const userId = req.user.userId;
        const { assignedTo, role = 'collaborator' } = req.body;

        if (!Array.isArray(assignedTo)) {
            return reply.code(400).send({
                success: false,
                message: 'assignedTo phải là một mảng'
            });
        }

        const plan = await PlanService.getPlanById(planId, userId);
        if (!plan) {
            return reply.code(404).send({
                success: false,
                message: 'Không tìm thấy kế hoạch'
            });
        }

        const task = plan.tasks.find(t => t.id === taskId);
        if (!task) {
            return reply.code(404).send({
                success: false,
                message: 'Không tìm thấy task'
            });
        }

        // Add assignments
        const newAssignments = assignedTo.map(userIdToAssign => ({
            userId: userIdToAssign,
            user: userIdToAssign,
            role,
            assignedAt: new Date(),
            assignedBy: userId,
            assignedByUser: userId
        }));

        // Remove existing assignments for these users
        task.assignedTo = task.assignedTo.filter(assignment =>
            !assignedTo.includes(assignment.userId.toString())
        );

        // Add new assignments
        task.assignedTo.push(...newAssignments);
        task.updatedAt = new Date();

        await plan.save();
        await plan.populate('tasks.assignedTo.userId', 'name email avatar');

        return reply.code(200).send({
            success: true,
            data: plan,
            message: 'Phân công task thành công'
        });
    } catch (error) {
        console.error('Assign task error:', error);
        return reply.code(500).send({
            success: false,
            message: error.message || 'Lỗi server khi phân công task'
        });
    }
};

// Add comment to task
exports.addCommentToTask = async (req, reply) => {
    try {
        const { planId, taskId } = req.params;
        const userId = req.user.userId;
        const { content } = req.body;

        if (!content || content.trim() === '') {
            return reply.code(400).send({
                success: false,
                message: 'Nội dung comment không được để trống'
            });
        }

        const plan = await PlanService.getPlanById(planId, userId);
        if (!plan) {
            return reply.code(404).send({
                success: false,
                message: 'Không tìm thấy kế hoạch'
            });
        }

        const task = plan.tasks.find(t => t.id === taskId);
        if (!task) {
            return reply.code(404).send({
                success: false,
                message: 'Không tìm thấy task'
            });
        }

        const newComment = {
            id: new require('mongoose').Types.ObjectId().toString(),
            content: content.trim(),
            author: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
            isEdited: false
        };

        task.comments.push(newComment);
        task.updatedAt = new Date();

        await plan.save();
        await plan.populate('tasks.comments.author', 'name email avatar');

        return reply.code(201).send({
            success: true,
            data: plan,
            message: 'Thêm comment thành công'
        });
    } catch (error) {
        console.error('Add comment to task error:', error);
        return reply.code(500).send({
            success: false,
            message: error.message || 'Lỗi server khi thêm comment'
        });
    }
};

// ✅ DASHBOARD & MY TASKS METHODS

// Get user dashboard
exports.getUserDashboard = async (req, reply) => {
    try {
        const userId = req.user.userId;

        // Get user stats
        const stats = await PlanService.getUserPlanStats(userId);

        // Get recent plans
        const recentPlans = await PlanService.getUserPlans(userId, {
            page: 1,
            limit: 5,
            sortBy: 'updatedAt',
            sortOrder: 'desc'
        });

        // Get upcoming tasks (tasks with due dates in next 7 days)
        const upcomingDeadline = new Date();
        upcomingDeadline.setDate(upcomingDeadline.getDate() + 7);

        const plansWithUpcomingTasks = await require('../../models/Plan').find({
            $or: [
                { userId: userId },
                { 'collaborators.userId': userId }
            ],
            'tasks.dueDate': {
                $gte: new Date(),
                $lte: upcomingDeadline
            }
        })
            .populate('userId', 'name email avatar')
            .lean();

        const upcomingTasks = [];
        plansWithUpcomingTasks.forEach(plan => {
            plan.tasks.forEach(task => {
                if (task.dueDate &&
                    new Date(task.dueDate) >= new Date() &&
                    new Date(task.dueDate) <= upcomingDeadline &&
                    task.status !== 'completed') {
                    upcomingTasks.push({
                        ...task,
                        planId: plan._id,
                        planTitle: plan.title
                    });
                }
            });
        });

        // Sort upcoming tasks by due date
        upcomingTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        const dashboardData = {
            stats,
            recentPlans: recentPlans.plans,
            upcomingTasks: upcomingTasks.slice(0, 10), // Limit to 10 tasks
            summary: {
                totalPlans: stats.totalPlans,
                activePlans: stats.activePlans,
                completedPlans: stats.completedPlans,
                totalTasks: stats.totalTasks,
                completedTasks: stats.completedTasks,
                completionPercentage: stats.completionPercentage,
                upcomingTasksCount: upcomingTasks.length
            }
        };

        return reply.code(200).send({
            success: true,
            data: dashboardData,
            message: 'Lấy dashboard thành công'
        });
    } catch (error) {
        console.error('Get user dashboard error:', error);
        return reply.code(500).send({
            success: false,
            message: error.message || 'Lỗi server khi lấy dashboard'
        });
    }
};

// Get my assigned tasks
exports.getMyTasks = async (req, reply) => {
    try {
        const userId = req.user.userId;
        const {
            status,
            priority,
            page = 1,
            limit = 20,
            sortBy = 'dueDate',
            sortOrder = 'asc'
        } = req.query;

        // Build query to find plans where user is assigned to tasks
        const query = {
            $or: [
                { userId: userId },
                { 'collaborators.userId': userId },
                { 'tasks.assignedTo.userId': userId }
            ]
        };

        const plans = await require('../../models/Plan').find(query)
            .populate('userId', 'name email avatar')
            .populate('tasks.assignedTo.userId', 'name email avatar')
            .lean();

        // Extract tasks assigned to the user
        const myTasks = [];
        plans.forEach(plan => {
            plan.tasks.forEach(task => {
                const isAssigned = task.assignedTo.some(assignment =>
                    assignment.userId.toString() === userId
                );

                if (isAssigned) {
                    // Apply filters
                    if (status && task.status !== status) return;
                    if (priority && task.priority !== priority) return;

                    myTasks.push({
                        ...task,
                        planId: plan._id,
                        planTitle: plan.title,
                        planCategory: plan.category,
                        planOwner: plan.userId
                    });
                }
            });
        });

        // Sort tasks
        myTasks.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            if (sortBy === 'dueDate') {
                aValue = aValue ? new Date(aValue) : new Date('9999-12-31');
                bValue = bValue ? new Date(bValue) : new Date('9999-12-31');
            }

            if (sortOrder === 'desc') {
                return bValue > aValue ? 1 : -1;
            } else {
                return aValue > bValue ? 1 : -1;
            }
        });

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedTasks = myTasks.slice(startIndex, endIndex);

        const pagination = {
            currentPage: parseInt(page),
            totalPages: Math.ceil(myTasks.length / limit),
            totalItems: myTasks.length,
            itemsPerPage: parseInt(limit),
            hasNext: endIndex < myTasks.length,
            hasPrev: startIndex > 0
        };

        return reply.code(200).send({
            success: true,
            data: paginatedTasks,
            pagination,
            message: 'Lấy danh sách task được phân công thành công'
        });
    } catch (error) {
        console.error('Get my tasks error:', error);
        return reply.code(500).send({
            success: false,
            message: error.message || 'Lỗi server khi lấy danh sách task'
        });
    }
};

// ✅ ADDITIONAL METHODS

// Get plans with group support
exports.getPlansWithGroups = async (req, reply) => {
    try {
        const userId = req.user.userId;
        const {
            page = 1,
            limit = 10,
            search,
            category,
            status,
            priority,
            includeGroups = true,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            search,
            category,
            status,
            priority,
            sortBy,
            sortOrder
        };

        const plans = await PlanService.getUserPlans(userId, options);

        return reply.code(200).send({
            success: true,
            data: plans.plans,
            pagination: plans.pagination,
            message: 'Lấy danh sách kế hoạch (bao gồm nhóm) thành công'
        });
    } catch (error) {
        console.error('Get plans with groups error:', error);
        return reply.code(500).send({
            success: false,
            message: error.message || 'Lỗi server khi lấy danh sách kế hoạch'
        });
    }
};

// Toggle task completion
exports.toggleTaskCompletion = async (req, reply) => {
    try {
        const { planId, taskId } = req.params;
        const userId = req.user.userId;

        const plan = await PlanService.getPlanById(planId, userId);
        if (!plan) {
            return reply.code(404).send({
                success: false,
                message: 'Không tìm thấy kế hoạch'
            });
        }

        const task = plan.tasks.find(t => t.id === taskId);
        if (!task) {
            return reply.code(404).send({
                success: false,
                message: 'Không tìm thấy task'
            });
        }

        // Toggle status between completed and todo
        task.status = task.status === 'completed' ? 'todo' : 'completed';
        task.updatedAt = new Date();

        await plan.save();

        return reply.code(200).send({
            success: true,
            data: { task },
            message: `Task đã được ${task.status === 'completed' ? 'hoàn thành' : 'đánh dấu chưa hoàn thành'}`
        });
    } catch (error) {
        console.error('Toggle task completion error:', error);
        return reply.code(500).send({
            success: false,
            message: error.message || 'Lỗi server khi thay đổi trạng thái task'
        });
    }
};

// Update task status
exports.updateTaskStatus = async (req, reply) => {
    try {
        const { planId, taskId } = req.params;
        const userId = req.user.userId;
        const { status } = req.body;

        const validStatuses = ['todo', 'in-progress', 'completed', 'blocked'];
        if (!validStatuses.includes(status)) {
            return reply.code(400).send({
                success: false,
                message: 'Trạng thái task không hợp lệ'
            });
        }

        const updatedPlan = await PlanService.updateTaskInPlan(planId, taskId, userId, { status });

        if (!updatedPlan) {
            return reply.code(404).send({
                success: false,
                message: 'Không tìm thấy kế hoạch hoặc task'
            });
        }

        const updatedTask = updatedPlan.tasks.find(t => t.id === taskId);

        return reply.code(200).send({
            success: true,
            data: { task: updatedTask },
            message: 'Cập nhật trạng thái task thành công'
        });
    } catch (error) {
        console.error('Update task status error:', error);
        return reply.code(500).send({
            success: false,
            message: error.message || 'Lỗi server khi cập nhật trạng thái task'
        });
    }
};

module.exports = exports;

