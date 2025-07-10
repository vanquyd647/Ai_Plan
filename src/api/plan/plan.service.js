const Plan = require('../../models/Plan');
const mongoose = require('mongoose');

// ✅ UNIFIED: Create plan (both manual and AI-generated)
exports.createPlan = async (planData) => {
    try {
        // ✅ Handle AI-generated specific fields
        if (planData.source === 'ai-generated') {
            planData.aiGeneratedAt = planData.aiGeneratedAt || new Date();
        }
        
        const plan = new Plan(planData);
        const savedPlan = await plan.save();
        
        // ✅ Populate user info
        await savedPlan.populate('userId', 'name email avatar');
        await savedPlan.populate('createdBy', 'name email avatar');
        
        return savedPlan;
    } catch (error) {
        console.error('Create plan service error:', error);
        throw new Error('Không thể tạo kế hoạch: ' + error.message);
    }
};

// ✅ Get user plans with filtering and pagination
exports.getUserPlans = async (userId, options = {}) => {
    try {
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
        } = options;

        // Build query
        const query = {
            $or: [
                { userId: userId },
                { 'collaborators.userId': userId }
            ]
        };

        // Add filters
        if (search) {
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { tags: { $regex: search, $options: 'i' } }
                ]
            });
        }

        if (category) query.category = category;
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (source) query.source = source;

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with pagination
        const skip = (page - 1) * limit;
        
        const [plans, total] = await Promise.all([
            Plan.find(query)
                .populate('userId', 'name email avatar')
                .populate('createdBy', 'name email avatar')
                .populate('collaborators.userId', 'name email avatar')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            Plan.countDocuments(query)
        ]);

        return {
            plans,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        };
    } catch (error) {
        console.error('Get user plans service error:', error);
        throw new Error('Không thể lấy danh sách kế hoạch: ' + error.message);
    }
};

// ✅ Get plan by ID
exports.getPlanById = async (planId, userId) => {
    try {
        const plan = await Plan.findOne({
            _id: planId,
            $or: [
                { userId: userId },
                { 'collaborators.userId': userId }
            ]
        })
        .populate('userId', 'name email avatar')
        .populate('createdBy', 'name email avatar')
        .populate('collaborators.userId', 'name email avatar')
        .populate('tasks.assignedTo.userId', 'name email avatar')
        .populate('tasks.comments.author', 'name email avatar');

        return plan;
    } catch (error) {
        console.error('Get plan by ID service error:', error);
        throw new Error('Không thể lấy kế hoạch: ' + error.message);
    }
};

// ✅ Update plan
exports.updatePlan = async (planId, userId, updateData) => {
    try {
        const plan = await Plan.findOneAndUpdate(
            {
                _id: planId,
                $or: [
                    { userId: userId },
                    { 
                        'collaborators.userId': userId,
                        'collaborators.permissions': { $in: ['edit'] }
                    }
                ]
            },
            { 
                ...updateData, 
                updatedAt: new Date() 
            },
            { 
                new: true, 
                runValidators: true 
            }
        )
        .populate('userId', 'name email avatar')
        .populate('createdBy', 'name email avatar')
        .populate('collaborators.userId', 'name email avatar');

        return plan;
    } catch (error) {
        console.error('Update plan service error:', error);
        throw new Error('Không thể cập nhật kế hoạch: ' + error.message);
    }
};

// ✅ Delete plan
exports.deletePlan = async (planId, userId) => {
    try {
        const plan = await Plan.findOneAndDelete({
            _id: planId,
            userId: userId // Only owner can delete
        });

        return plan;
    } catch (error) {
        console.error('Delete plan service error:', error);
        throw new Error('Không thể xóa kế hoạch: ' + error.message);
    }
};

// ✅ Get user plan statistics
exports.getUserPlanStats = async (userId) => {
    try {
        const stats = await Plan.aggregate([
            {
                $match: {
                    $or: [
                        { userId: new mongoose.Types.ObjectId(userId) },
                        { 'collaborators.userId': new mongoose.Types.ObjectId(userId) }
                    ]
                }
            },
            {
                $group: {
                    _id: null,
                    totalPlans: { $sum: 1 },
                    draftPlans: {
                        $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
                    },
                    activePlans: {
                        $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                    },
                    completedPlans: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    archivedPlans: {
                        $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] }
                    },
                    totalTasks: { $sum: { $size: '$tasks' } },
                    completedTasks: {
                        $sum: {
                            $size: {
                                $filter: {
                                    input: '$tasks',
                                    cond: { $eq: ['$$this.status', 'completed'] }
                                }
                            }
                        }
                    },
                    manualPlans: {
                        $sum: { $cond: [{ $eq: ['$source', 'manual'] }, 1, 0] }
                    },
                    aiGeneratedPlans: {
                        $sum: { $cond: [{ $eq: ['$source', 'ai-generated'] }, 1, 0] }
                    }
                }
            }
        ]);

        const result = stats[0] || {
            totalPlans: 0,
            draftPlans: 0,
            activePlans: 0,
            completedPlans: 0,
            archivedPlans: 0,
            totalTasks: 0,
            completedTasks: 0,
            manualPlans: 0,
            aiGeneratedPlans: 0
        };

        // Calculate completion percentage
        result.completionPercentage = result.totalTasks > 0 
            ? Math.round((result.completedTasks / result.totalTasks) * 100) 
            : 0;

        return result;
    } catch (error) {
        console.error('Get user plan stats service error:', error);
        throw new Error('Không thể lấy thống kê kế hoạch: ' + error.message);
    }
};

// ✅ Duplicate plan
exports.duplicatePlan = async (planId, userId, newTitle) => {
    try {
        const originalPlan = await Plan.findOne({
            _id: planId,
            $or: [
                { userId: userId },
                { 'collaborators.userId': userId }
            ]
        });

        if (!originalPlan) {
            return null;
        }

        const duplicatedPlanData = {
            ...originalPlan.toObject(),
            _id: undefined,
            title: newTitle || `${originalPlan.title} (Copy)`,
            userId: userId,
            createdBy: userId,
            status: 'draft',
            collaborators: [], // Reset collaborators
            shareSettings: {
                isShared: false,
                shareToken: undefined,
                shareType: 'view',
                expiresAt: undefined
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Reset task IDs and timestamps
        if (duplicatedPlanData.tasks) {
            duplicatedPlanData.tasks = duplicatedPlanData.tasks.map(task => ({
                ...task,
                id: new mongoose.Types.ObjectId().toString(),
                status: 'todo',
                assignedTo: [],
                comments: [],
                createdAt: new Date(),
                updatedAt: new Date()
            }));
        }

        const duplicatedPlan = new Plan(duplicatedPlanData);
        const savedPlan = await duplicatedPlan.save();

        await savedPlan.populate('userId', 'name email avatar');
        await savedPlan.populate('createdBy', 'name email avatar');

        return savedPlan;
    } catch (error) {
        console.error('Duplicate plan service error:', error);
        throw new Error('Không thể sao chép kế hoạch: ' + error.message);
    }
};

// ✅ Generate share link
exports.generateShareLink = async (planId, userId, shareType = 'view', expiresIn) => {
    try {
        const plan = await Plan.findOne({
            _id: planId,
            userId: userId // Only owner can share
        });

        if (!plan) {
            return null;
        }

        const shareToken = require('crypto').randomBytes(32).toString('hex');
        const expiresAt = expiresIn ? new Date(Date.now() + expiresIn) : undefined;

        plan.shareSettings = {
            isShared: true,
            shareToken,
            shareType,
            expiresAt
        };

        await plan.save();

        return `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/plans/${shareToken}`;
    } catch (error) {
        console.error('Generate share link service error:', error);
        throw new Error('Không thể tạo link chia sẻ: ' + error.message);
    }
};

// ✅ Export plan
exports.exportPlan = async (planId, userId, format = 'json') => {
    try {
        const plan = await Plan.findOne({
            _id: planId,
            $or: [
                { userId: userId },
                { 'collaborators.userId': userId }
            ]
        })
        .populate('userId', 'name email avatar')
        .populate('createdBy', 'name email avatar')
        .lean();

        if (!plan) {
            return null;
        }

        switch (format) {
            case 'json':
                return JSON.stringify(plan, null, 2);
            
            case 'csv':
                // Simple CSV export for tasks
                const csvHeaders = ['Task Title', 'Description', 'Status', 'Priority', 'Due Date'];
                const csvRows = plan.tasks.map(task => [
                    task.title,
                    task.description || '',
                    task.status,
                    task.priority,
                    task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''
                ]);
                
                return [csvHeaders, ...csvRows]
                    .map(row => row.map(field => `"${field}"`).join(','))
                    .join('\n');
            
            default:
                return JSON.stringify(plan, null, 2);
        }
    } catch (error) {
        console.error('Export plan service error:', error);
        throw new Error('Không thể xuất kế hoạch: ' + error.message);
    }
};

// ✅ Add task to plan
exports.addTaskToPlan = async (planId, userId, taskData) => {
    try {
        const plan = await Plan.findOne({
            _id: planId,
            $or: [
                { userId: userId },
                { 
                    'collaborators.userId': userId,
                    'collaborators.permissions': { $in: ['edit', 'manage_tasks'] }
                }
            ]
        });

        if (!plan) {
            return null;
        }

        const newTask = {
            ...taskData,
            id: new mongoose.Types.ObjectId().toString(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        plan.tasks.push(newTask);
        await plan.save();

        return plan;
    } catch (error) {
        console.error('Add task to plan service error:', error);
        throw new Error('Không thể thêm task: ' + error.message);
    }
};

// ✅ Update task in plan
exports.updateTaskInPlan = async (planId, taskId, userId, updateData) => {
    try {
        const plan = await Plan.findOne({
            _id: planId,
            $or: [
                { userId: userId },
                { 
                    'collaborators.userId': userId,
                    'collaborators.permissions': { $in: ['edit', 'manage_tasks'] }
                }
            ]
        });

        if (!plan) {
            return null;
        }

        const task = plan.tasks.find(t => t.id === taskId);
        if (!task) {
            return null;
        }

        Object.assign(task, updateData);
        task.updatedAt = new Date();

        await plan.save();
        return plan;
    } catch (error) {
        console.error('Update task in plan service error:', error);
        throw new Error('Không thể cập nhật task: ' + error.message);
    }
};

// ✅ Delete task from plan
exports.deleteTaskFromPlan = async (planId, taskId, userId) => {
    try {
        const plan = await Plan.findOne({
            _id: planId,
            $or: [
                { userId: userId },
                { 
                    'collaborators.userId': userId,
                    'collaborators.permissions': { $in: ['edit', 'manage_tasks'] }
                }
            ]
        });

        if (!plan) {
            return null;
        }

        plan.tasks = plan.tasks.filter(task => task.id !== taskId);
        await plan.save();

        return plan;
    } catch (error) {
        console.error('Delete task from plan service error:', error);
        throw new Error('Không thể xóa task: ' + error.message);
    }
};

// ✅ Additional service methods for collaboration, comments, etc.
// (Include all other methods from the original file...)

module.exports = exports;
