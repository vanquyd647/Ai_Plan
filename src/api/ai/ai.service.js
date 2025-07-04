const Gemini = require('../../utils/gemini');
const AISession = require('../ai/sessions/aiSession.service');
const AIInteraction = require('../../models/AIInteraction');

// ✅ Service gốc - giữ nguyên cho compatibility
exports.generateContent = async (formattedPrompt) => {
    try {
        console.log('🤖 Calling Gemini with prompt:', formattedPrompt);
        
        const startTime = Date.now();
        const response = await Gemini.generateResponse(formattedPrompt);
        const processingTime = Date.now() - startTime;
        
        console.log('✅ Gemini response received in', processingTime, 'ms');
        console.log('📝 Response length:', response?.length || 0);
        
        return response;
    } catch (error) {
        console.error('❌ AI Service Error:', error.message);
        throw error;
    }
};

// ✅ Service mới với user tracking và database saving
exports.generateContentWithTracking = async (userId, type, input, formattedPrompt) => {
    let interaction = null;
    
    try {
        // Tạo record tracking trước khi gọi AI
        interaction = new AIInteraction({
            userId: userId,
            type: type,
            prompt: input,
            formattedPrompt: formattedPrompt,
            status: 'pending'
        });
        
        await interaction.save();
        console.log('📝 Created AI interaction record:', interaction._id);

        // Gọi AI service
        const startTime = Date.now();
        const aiResponse = await Gemini.generateContent(formattedPrompt);
        const processingTime = Date.now() - startTime;

        if (!aiResponse || aiResponse.trim().length === 0) {
            throw new Error('AI service returned empty response');
        }

        // Parse response nếu là JSON
        let parsedResponse = null;
        if (type === 'planner') {
            try {
                const cleanedResponse = aiResponse
                    .replace(/```json|```/g, '')
                    .trim();
                parsedResponse = JSON.parse(cleanedResponse);
            } catch (parseError) {
                console.warn('⚠️ Failed to parse AI response as JSON:', parseError.message);
                // Không throw error, vẫn lưu raw response
            }
        }

        // Cập nhật record với kết quả
        interaction.rawResponse = aiResponse;
        interaction.parsedResponse = parsedResponse;
        interaction.status = 'completed';
        interaction.metadata = {
            responseTime: Date.now(),
            tokenCount: aiResponse.length,
            model: 'gemini-pro',
            processingTime: processingTime
        };

        await interaction.save();
        console.log('✅ Updated AI interaction record with response');

        return {
            interaction: interaction,
            rawResponse: aiResponse,
            parsedResponse: parsedResponse
        };

    } catch (error) {
        console.error('❌ AI Service with tracking error:', error.message);
        
        // Cập nhật record với lỗi nếu có
        if (interaction) {
            try {
                interaction.status = 'failed';
                interaction.error = {
                    message: error.message,
                    stack: error.stack,
                    timestamp: new Date()
                };
                await interaction.save();
                console.log('📝 Updated AI interaction record with error');
            } catch (dbError) {
                console.error('❌ Failed to save error to interaction record:', dbError.message);
            }
        }
        
        throw error;
    }
};

// ✅ Service để lấy AI interaction theo ID
exports.getAIInteraction = async (userId, interactionId) => {
    try {
        const interaction = await AIInteraction.findOne({
            _id: interactionId,
            userId: userId
        });

        if (!interaction) {
            throw new Error('AI interaction not found or access denied');
        }

        return interaction;
    } catch (error) {
        console.error('❌ Get AI interaction error:', error.message);
        throw error;
    }
};

// ✅ Service để lấy lịch sử AI của user
exports.getAIHistory = async (userId, options = {}) => {
    try {
        const {
            page = 1,
            limit = 10,
            type = null,
            status = null,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = options;

        const filter = { userId };
        
        if (type) {
            filter.type = type;
        }
        
        if (status) {
            filter.status = status;
        }

        const skip = (page - 1) * limit;
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const [interactions, total] = await Promise.all([
            AIInteraction.find(filter)
                .select('type prompt parsedResponse status createdAt metadata error')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(), // Tối ưu performance
            AIInteraction.countDocuments(filter)
        ]);

        return {
            interactions,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                count: interactions.length,
                totalRecords: total
            }
        };

    } catch (error) {
        console.error('❌ Get AI history error:', error.message);
        throw error;
    }
};

// ✅ Service để xóa AI interaction (soft delete)
exports.deleteAIInteraction = async (userId, interactionId) => {
    try {
        const interaction = await AIInteraction.findOneAndUpdate(
            {
                _id: interactionId,
                userId: userId
            },
            {
                status: 'deleted',
                deletedAt: new Date()
            },
            { new: true }
        );

        if (!interaction) {
            throw new Error('AI interaction not found or access denied');
        }

        return interaction;
    } catch (error) {
        console.error('❌ Delete AI interaction error:', error.message);
        throw error;
    }
};

// ✅ Service để lấy thống kê AI usage của user
exports.getAIStats = async (userId, timeRange = '30d') => {
    try {
        const now = new Date();
        let startDate;

        switch (timeRange) {
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const stats = await AIInteraction.aggregate([
            {
                $match: {
                    userId: userId,
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        type: '$type',
                        status: '$status'
                    },
                    count: { $sum: 1 },
                    totalTokens: { $sum: '$metadata.tokenCount' },
                    avgProcessingTime: { $avg: '$metadata.processingTime' }
                }
            },
            {
                $group: {
                    _id: '$_id.type',
                    total: { $sum: '$count' },
                    completed: {
                        $sum: {
                            $cond: [{ $eq: ['$_id.status', 'completed'] }, '$count', 0]
                        }
                    },
                    failed: {
                        $sum: {
                            $cond: [{ $eq: ['$_id.status', 'failed'] }, '$count', 0]
                        }
                    },
                    totalTokens: { $sum: '$totalTokens' },
                    avgProcessingTime: { $avg: '$avgProcessingTime' }
                }
            }
        ]);

        return {
            timeRange,
            startDate,
            endDate: now,
            stats
        };

    } catch (error) {
        console.error('❌ Get AI stats error:', error.message);
        throw error;
    }
};
