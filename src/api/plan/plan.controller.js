const PlanService = require('../plan/plan.service');

// ✅ Get all plans for authenticated user
exports.getPlans = async (req, reply) => {
    try {
        const userId = req.user.userId; // From auth middleware
        const { page = 1, limit = 10, search, category, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        const plans = await PlanService.getUserPlans(userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            search,
            category,
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

// ✅ Get specific plan by ID
exports.getPlanById = async (req, reply) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

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
            message: 'Lấy thông tin kế hoạch thành công'
        });
    } catch (error) {
        console.error('Get plan by ID error:', error);
        return reply.code(500).send({
            success: false,
            message: error.message || 'Lỗi server khi lấy thông tin kế hoạch'
        });
    }
};

// ✅ Create plan manually
exports.createPlan = async (req, reply) => {
    try {
        const userId = req.user.userId; // From auth middleware
        const planData = {
            ...req.body,
            userId, // Associate plan with authenticated user
            createdBy: 'manual'
        };

        console.log('📝 Received plan data to save:', planData);

        // Validate required fields
        if (!planData.title || !planData.description) {
            return reply.code(400).send({
                success: false,
                message: 'Tiêu đề và mô tả là bắt buộc'
            });
        }

        const newPlan = await PlanService.createPlan(planData);

        return reply.code(201).send({
            success: true,
            data: newPlan,
            message: 'Tạo kế hoạch thành công'
        });
    } catch (error) {
        console.error('Create plan error:', error);
        return reply.code(500).send({
            success: false,
            message: error.message || 'Lỗi server khi tạo kế hoạch'
        });
    }
};

// ✅ Save AI generated plan
exports.saveAIGeneratedPlan = async (req, reply) => {
    try {
        const userId = req.user.userId;
        const requestData = req.body;
        
        console.log('🤖 Raw AI plan data received:', JSON.stringify(requestData, null, 2));

        // ✅ Extract plan data from the structure
        let planInfo = {};
        
        if (requestData.planData) {
            planInfo = requestData.planData;
        } else {
            planInfo = requestData;
        }

        // ✅ Build plan object with correct structure
        const planData = {
            userId,
            createdBy: 'ai',
            
            // Basic fields
            title: planInfo.title || 
                   requestData.title || 
                   'Kế hoạch từ AI',
                   
            description: planInfo.objective || 
                        planInfo.description || 
                        requestData.objective ||
                        requestData.description ||
                        'Kế hoạch được tạo bởi AI',
                        
            category: planInfo.category || 
                     requestData.category || 
                     'Du lịch',
                     
            status: requestData.status || 'draft',
            priority: requestData.priority || 'medium',
            tags: planInfo.tags || requestData.tags || ['AI', 'Generated'],

            // ✅ Process steps directly from AI data
            steps: [],
            
            // ✅ Process risks directly from AI data
            risks: [],
            
            // Store AI metadata
            aiMetadata: {
                prompt: requestData.metadata?.originalInput || 
                       requestData.originalInput ||
                       'Unknown prompt',
                       
                model: requestData.metadata?.model || 
                      requestData.model || 
                      'gpt-3.5-turbo',
                      
                generatedAt: new Date(),
                confidence: requestData.confidence || 0.8,
                originalData: requestData
            }
        };

        // ✅ Convert AI steps to plan steps
        if (planInfo.steps && Array.isArray(planInfo.steps)) {
            planData.steps = planInfo.steps.map((step, index) => {
                // Handle different step structures from AI
                let description, timeline, resources;
                
                if (typeof step === 'object') {
                    description = step.description || 
                                 step.title || 
                                 step.name ||
                                 step.step ||
                                 step.activity ||
                                 `Bước ${index + 1}`;
                                 
                    timeline = step.timeline || 
                              step.time || 
                              step.duration ||
                              step.when ||
                              step.schedule ||
                              'Chưa xác định';
                              
                    resources = step.resources || 
                               step.resource ||
                               step.requirements ||
                               step.needs ||
                               step.materials ||
                               'Chưa xác định';
                } else {
                    // If step is just a string
                    description = step.toString();
                    timeline = 'Chưa xác định';
                    resources = 'Chưa xác định';
                }

                return {
                    description,
                    timeline,
                    resources
                };
            });
        }

        // ✅ Convert AI risks to plan risks
        if (planInfo.risks && Array.isArray(planInfo.risks)) {
            planData.risks = planInfo.risks.map((riskItem, index) => {
                let risk, mitigation;
                
                if (typeof riskItem === 'object') {
                    risk = riskItem.risk || 
                          riskItem.title || 
                          riskItem.name ||
                          riskItem.description ||
                          `Rủi ro ${index + 1}`;
                          
                    mitigation = riskItem.mitigation || 
                                riskItem.solution ||
                                riskItem.prevention ||
                                riskItem.handling ||
                                riskItem.response ||
                                'Cần xây dựng biện pháp phòng ngừa';
                } else {
                    // If risk is just a string
                    risk = riskItem.toString();
                    mitigation = 'Cần xây dựng biện pháp phòng ngừa';
                }

                return {
                    risk,
                    mitigation
                };
            });
        }

        console.log('🔄 Processed plan data:', JSON.stringify({
            title: planData.title,
            description: planData.description.substring(0, 100) + '...',
            stepsCount: planData.steps.length,
            risksCount: planData.risks.length,
            category: planData.category
        }, null, 2));

        // ✅ Validate essential fields
        if (!planData.title || planData.title.trim() === '') {
            console.error('❌ Missing title in processed data');
            return reply.code(400).send({
                success: false,
                message: 'Không thể tìm thấy tiêu đề kế hoạch',
                error: 'MISSING_TITLE'
            });
        }

        if (!planData.description || planData.description.trim() === '') {
            console.error('❌ Missing description in processed data');
            return reply.code(400).send({
                success: false,
                message: 'Không thể tìm thấy mô tả kế hoạch',
                error: 'MISSING_DESCRIPTION'
            });
        }

        // ✅ Validate steps structure
        if (planData.steps.length === 0) {
            console.warn('⚠️ No steps found in AI data');
        } else {
            // Validate each step has required fields
            for (let i = 0; i < planData.steps.length; i++) {
                const step = planData.steps[i];
                if (!step.description || !step.timeline || !step.resources) {
                    console.error(`❌ Step ${i + 1} missing required fields:`, step);
                    return reply.code(400).send({
                        success: false,
                        message: `Bước ${i + 1} thiếu thông tin bắt buộc`,
                        error: 'INVALID_STEP_STRUCTURE',
                        step: step
                    });
                }
            }
        }

        // ✅ Validate risks structure
        if (planData.risks.length > 0) {
            for (let i = 0; i < planData.risks.length; i++) {
                const riskItem = planData.risks[i];
                if (!riskItem.risk || !riskItem.mitigation) {
                    console.error(`❌ Risk ${i + 1} missing required fields:`, riskItem);
                    return reply.code(400).send({
                        success: false,
                        message: `Rủi ro ${i + 1} thiếu thông tin bắt buộc`,
                        error: 'INVALID_RISK_STRUCTURE',
                        risk: riskItem
                    });
                }
            }
        }

        // ✅ Save plan
        console.log('💾 Saving plan with structure:', {
            title: planData.title,
            description: planData.description.substring(0, 50) + '...',
            userId: planData.userId,
            stepsCount: planData.steps.length,
            risksCount: planData.risks.length,
            createdBy: planData.createdBy
        });

        const savedPlan = await PlanService.createPlan(planData);
        
        console.log('✅ AI plan saved successfully:', savedPlan.id);

        return reply.code(201).send({
            success: true,
            message: 'Kế hoạch AI đã được lưu thành công',
            data: {
                id: savedPlan._id,
                title: savedPlan.title,
                description: savedPlan.description,
                category: savedPlan.category,
                status: savedPlan.status,
                priority: savedPlan.priority,
                stepsCount: savedPlan.steps.length,
                risksCount: savedPlan.risks.length,
                createdAt: savedPlan.createdAt
            }
        });

    } catch (error) {
        console.error('❌ Save AI plan error:', error);
        
        return reply.code(500).send({
            success: false,
            message: 'Lỗi khi lưu kế hoạch AI: ' + error.message,
            error: error.message
        });
    }
};

// ✅ Update existing plan
exports.updatePlan = async (req, reply) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const updateData = req.body;

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
        const userId = req.user.userId;
        const { id } = req.params;

        const deleted = await PlanService.deletePlan(id, userId);

        if (!deleted) {
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

// ✅ Duplicate existing plan
exports.duplicatePlan = async (req, reply) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
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

// ✅ Share plan
exports.sharePlan = async (req, reply) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const { shareType = 'view', expiresIn = '7d' } = req.body;

        const shareData = await PlanService.sharePlan(id, userId, shareType, expiresIn);

        if (!shareData) {
            return reply.code(404).send({
                success: false,
                message: 'Không tìm thấy kế hoạch để chia sẻ'
            });
        }

        return reply.code(200).send({
            success: true,
            data: shareData,
            message: 'Tạo liên kết chia sẻ thành công'
        });
    } catch (error) {
        console.error('Share plan error:', error);
        return reply.code(500).send({
            success: false,
            message: error.message || 'Lỗi server khi chia sẻ kế hoạch'
        });
    }
};

// ✅ Export plan
exports.exportPlan = async (req, reply) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const { format = 'json' } = req.query;

        const exportData = await PlanService.exportPlan(id, userId, format);

        if (!exportData) {
            return reply.code(404).send({
                success: false,
                message: 'Không tìm thấy kế hoạch để xuất'
            });
        }

        // Set appropriate headers based on format
        const headers = {
            json: { 'Content-Type': 'application/json' },
            pdf: { 'Content-Type': 'application/pdf' },
            csv: { 'Content-Type': 'text/csv' }
        };

        reply.headers(headers[format] || headers.json);

        return reply.code(200).send(exportData);
    } catch (error) {
        console.error('Export plan error:', error);
        return reply.code(500).send({
            success: false,
            message: error.message || 'Lỗi server khi xuất kế hoạch'
        });
    }
};
