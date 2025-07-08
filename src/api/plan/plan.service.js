const Plan = require('../../models/Plan');
const mongoose = require('mongoose');

// ✅ Create plan with user association
exports.createPlan = async (planData) => {
    try {
        const plan = new Plan(planData);
        const savedPlan = await plan.save();
        return savedPlan;
    } catch (error) {
        console.error('Create plan service error:', error);
        throw new Error('Không thể tạo kế hoạch: ' + error.message);
    }
};

// ✅ Get all plans for a specific user
exports.getUserPlans = async (userId, options = {}) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            category,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = options;
        
        // Build query
        const query = { userId };
        
        // Add search filter
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Add category filter
        if (category) {
            query.category = category;
        }
        
        // Calculate pagination
        const skip = (page - 1) * limit;
        const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
        
        // Execute query with pagination
        const [plans, totalCount] = await Promise.all([
            Plan.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean(),
            Plan.countDocuments(query)
        ]);
        
        return {
            plans,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalItems: totalCount,
                itemsPerPage: limit,
                hasNextPage: page < Math.ceil(totalCount / limit),
                hasPrevPage: page > 1
            }
        };
    } catch (error) {
        console.error('Get user plans service error:', error);
        throw new Error('Không thể lấy danh sách kế hoạch: ' + error.message);
    }
};

// ✅ Get plan by ID with user verification
exports.getPlanById = async (planId, userId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(planId)) {
            throw new Error('ID kế hoạch không hợp lệ');
        }
        
        const plan = await Plan.findOne({ 
            _id: planId, 
            userId 
        }).lean();
        
        return plan;
    } catch (error) {
        console.error('Get plan by ID service error:', error);
        throw new Error('Không thể lấy thông tin kế hoạch: ' + error.message);
    }
};

// ✅ Update plan with user verification
exports.updatePlan = async (planId, userId, updateData) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(planId)) {
            throw new Error('ID kế hoạch không hợp lệ');
        }
        
        // Remove fields that shouldn't be updated
        const { userId: _, createdAt, __v, ...cleanUpdateData } = updateData;
        cleanUpdateData.updatedAt = new Date();
        
        const updatedPlan = await Plan.findOneAndUpdate(
            { _id: planId, userId },
            cleanUpdateData,
            { new: true, runValidators: true }
        );
        
        return updatedPlan;
    } catch (error) {
        console.error('Update plan service error:', error);
        throw new Error('Không thể cập nhật kế hoạch: ' + error.message);
    }
};

// ✅ Delete plan with user verification
exports.deletePlan = async (planId, userId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(planId)) {
            throw new Error('ID kế hoạch không hợp lệ');
        }
        
        const deletedPlan = await Plan.findOneAndDelete({ 
            _id: planId, 
            userId 
        });
        
        return !!deletedPlan;
    } catch (error) {
        console.error('Delete plan service error:', error);
        throw new Error('Không thể xóa kế hoạch: ' + error.message);
    }
};

// ✅ Get user plan statistics
exports.getUserPlanStats = async (userId) => {
    try {
        const stats = await Plan.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalPlans: { $sum: 1 },
                    completedPlans: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    activePlans: {
                        $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                    },
                    draftPlans: {
                        $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
                    },
                    aiGeneratedPlans: {
                        $sum: { $cond: [{ $eq: ['$createdBy', 'ai'] }, 1, 0] }
                    },
                    manualPlans: {
                        $sum: { $cond: [{ $eq: ['$createdBy', 'manual'] }, 1, 0] }
                    }
                }
            }
        ]);
        
        const result = stats[0] || {
            totalPlans: 0,
            completedPlans: 0,
            activePlans: 0,
            draftPlans: 0,
            aiGeneratedPlans: 0,
            manualPlans: 0
        };
        
        // Calculate completion rate
        result.completionRate = result.totalPlans > 0 
            ? Math.round((result.completedPlans / result.totalPlans) * 100) 
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
            userId 
        }).lean();
        
        if (!originalPlan) {
            return null;
        }
        
        // Create new plan data
        const { _id, createdAt, updatedAt, __v, ...planData } = originalPlan;
        const duplicatedPlanData = {
            ...planData,
            title: newTitle || `${originalPlan.title} (Copy)`,
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const duplicatedPlan = new Plan(duplicatedPlanData);
        return await duplicatedPlan.save();
    } catch (error) {
        console.error('Duplicate plan service error:', error);
        throw new Error('Không thể sao chép kế hoạch: ' + error.message);
    }
};

// ✅ Share plan (generate share token)
exports.sharePlan = async (planId, userId, shareType, expiresIn) => {
    try {
        const plan = await Plan.findOne({ _id: planId, userId });
        
        if (!plan) {
            return null;
        }
        
        // Generate share token (you might want to use JWT or a random string)
        const crypto = require('crypto');
        const shareToken = crypto.randomBytes(32).toString('hex');
        
        // Calculate expiration date
        const expirationMap = {
            '1h': 1 * 60 * 60 * 1000,
            '1d': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000
        };
        
        const expiresAt = new Date(Date.now() + (expirationMap[expiresIn] || expirationMap['7d']));
        
        // Update plan with share info
        plan.shareSettings = {
            isShared: true,
            shareToken,
            shareType, // 'view' or 'edit'
            expiresAt,
            sharedAt: new Date()
        };
        
        await plan.save();
        
        return {
            shareToken,
            shareUrl: `${process.env.FRONTEND_URL}/shared/plan/${shareToken}`,
            shareType,
            expiresAt
        };
    } catch (error) {
        console.error('Share plan service error:', error);
        throw new Error('Không thể chia sẻ kế hoạch: ' + error.message);
    }
};

// ✅ Export plan
exports.exportPlan = async (planId, userId, format) => {
    try {
        const plan = await Plan.findOne({ _id: planId, userId }).lean();
        
        if (!plan) {
            return null;
        }
        
        switch (format) {
            case 'json':
                return plan;
            
            case 'csv':
                // Convert plan to CSV format
                const csvData = this.convertPlanToCSV(plan);
                return csvData;
            
            case 'pdf':
                // Generate PDF (you would need a PDF library like puppeteer or jsPDF)
                throw new Error('PDF export chưa được hỗ trợ');
            
            default:
                return plan;
        }
    } catch (error) {
        console.error('Export plan service error:', error);
        throw new Error('Không thể xuất kế hoạch: ' + error.message);
    }
};

// Helper function to convert plan to CSV
exports.convertPlanToCSV = (plan) => {
    const csvRows = [];
    csvRows.push('Field,Value');
    csvRows.push(`Title,"${plan.title}"`);
    csvRows.push(`Description,"${plan.description}"`);
    csvRows.push(`Category,"${plan.category || ''}"`);
    csvRows.push(`Status,"${plan.status}"`);
    csvRows.push(`Created By,"${plan.createdBy}"`);
    csvRows.push(`Created At,"${plan.createdAt}"`);
    csvRows.push(`Updated At,"${plan.updatedAt}"`);
    
    if (plan.tasks && plan.tasks.length > 0) {
        csvRows.push('');
        csvRows.push('Tasks:');
        csvRows.push('Task Title,Task Description,Status,Priority,Due Date');
        plan.tasks.forEach(task => {
            csvRows.push(`"${task.title}","${task.description || ''}","${task.status}","${task.priority || ''}","${task.dueDate || ''}"`);
        });
    }
    
    return csvRows.join('\n');
};

// ✅ Legacy method for backward compatibility
exports.getAllPlans = async () => {
    console.warn('getAllPlans is deprecated. Use getUserPlans instead.');
    try {
        const plans = await Plan.find({}).lean();
        return plans;
    } catch (error) {
        console.error('Get all plans service error:', error);
        throw new Error('Không thể lấy danh sách kế hoạch: ' + error.message);
    }
};
