const AIService = require('../ai/ai.service');
const AIPrompts = require('../ai/prompts');
const AIInteraction = require('../../models/AIInteraction');

exports.generatePlan = async (req, reply) => {
    try {
        const { input } = req.body;
        const userId = req.user.userId; // ✅ Lấy từ middleware xác thực

        if (!input || input.trim().length === 0) {
            return reply.code(400).send({
                success: false,
                message: 'Input is required and cannot be empty'
            });
        }

        // Lấy prompt từ planner
        const plannerPrompt = AIPrompts.getPromptByType('planner');
        if (!plannerPrompt) {
            return reply.code(500).send({
                success: false,
                message: 'Planner prompt not found'
            });
        }

        const formattedPrompt = plannerPrompt.replace('{input}', input);
        console.log('🔍 Formatted Prompt:', formattedPrompt);

        // Gọi AI Service
        const aiResponse = await AIService.generateContent(formattedPrompt);
        console.log('🤖 Raw AI Response:', aiResponse);

        if (!aiResponse || aiResponse.trim().length === 0) {
            return reply.code(500).send({
                success: false,
                message: 'AI service returned empty response'
            });
        }

        let planData;
        try {
            // Clean response
            const cleanedResponse = aiResponse
                .replace(/```json|```/g, '')
                .trim();
            
            console.log('🧹 Cleaned Response:', cleanedResponse);

            // Parse JSON
            planData = JSON.parse(cleanedResponse);
            console.log('📊 Parsed Plan Data:', planData);

            // Validate parsed data
            if (!planData || typeof planData !== 'object') {
                throw new Error('Parsed data is not a valid object');
            }

            // Ensure required fields
            if (!planData.title) {
                planData.title = planData.objective || 'Untitled Plan';
            }
            
            if (!planData.objective) {
                planData.objective = 'No objective provided';
            }

            if (!planData.steps || !Array.isArray(planData.steps)) {
                planData.steps = [];
            }

            if (!planData.risks || !Array.isArray(planData.risks)) {
                planData.risks = [];
            }

        } catch (parseError) {
            console.error('❌ Error parsing AI response:', parseError.message);
            console.error('📝 Raw AI Response:', aiResponse);

            return reply.code(400).send({
                success: false,
                message: `AI response parsing failed: ${parseError.message}`,
                rawResponse: aiResponse,
            });
        }

        // ✅ LƯU VÀO DATABASE
        try {
            const aiInteraction = new AIInteraction({
                userId: userId,
                type: 'planner',
                prompt: input,
                formattedPrompt: formattedPrompt,
                rawResponse: aiResponse,
                parsedResponse: planData,
                status: 'completed',
                metadata: {
                    responseTime: Date.now(),
                    tokenCount: aiResponse.length, // Rough estimate
                    model: 'gemini-pro' // Hoặc model bạn đang sử dụng
                }
            });

            const savedInteraction = await aiInteraction.save();
            console.log('💾 Saved AI interaction:', savedInteraction._id);

            // Thêm ID vào planData
            planData.id = savedInteraction._id;

            return reply.code(200).send({
                success: true,
                message: 'Plan generated and saved successfully',
                data: planData,
                metadata: {
                    generatedAt: savedInteraction.createdAt.toISOString(),
                    originalInput: input,
                    sessionId: savedInteraction._id
                }
            });

        } catch (dbError) {
            console.error('❌ Database save error:', dbError.message);
            
            // Vẫn trả về kết quả AI nhưng báo lỗi lưu DB
            return reply.code(200).send({
                success: true,
                message: 'Plan generated successfully but failed to save to database',
                data: planData,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    originalInput: input,
                    warning: 'Data not saved to database'
                }
            });
        }

    } catch (error) {
        console.error('💥 Controller Error:', error.message);
        console.error('📚 Error Stack:', error.stack);
        
        // ✅ LƯU LỖI VÀO DATABASE
        try {
            const errorInteraction = new AIInteraction({
                userId: req.user?.userId,
                type: 'planner',
                prompt: req.body?.input || '',
                status: 'failed',
                error: {
                    message: error.message,
                    stack: error.stack,
                    timestamp: new Date()
                }
            });
            await errorInteraction.save();
        } catch (dbError) {
            console.error('❌ Failed to save error to DB:', dbError.message);
        }
        
        return reply.code(500).send({ 
            success: false, 
            message: `Server error: ${error.message}` 
        });
    }
};

exports.getAISession = async (req, reply) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.userId;

        // ✅ Chỉ cho phép user xem session của mình
        const interaction = await AIInteraction.findOne({
            _id: sessionId,
            userId: userId
        });

        if (!interaction) {
            return reply.code(404).send({ 
                success: false, 
                message: 'Session not found or access denied' 
            });
        }

        return reply.code(200).send({
            success: true,
            data: {
                sessionId: interaction._id,
                type: interaction.type,
                prompt: interaction.prompt,
                response: interaction.parsedResponse || interaction.rawResponse,
                status: interaction.status,
                createdAt: interaction.createdAt.toISOString(),
                metadata: interaction.metadata
            },
        });
    } catch (error) {
        console.error('❌ Get session error:', error.message);
        return reply.code(500).send({ 
            success: false, 
            message: error.message 
        });
    }
};

// ✅ Controller mới để lấy lịch sử AI
exports.getAIHistory = async (req, reply) => {
    try {
        const userId = req.user.userId;
        const { page = 1, limit = 10, type } = req.query;

        const filter = { userId };
        if (type) {
            filter.type = type;
        }

        const skip = (page - 1) * limit;

        const [interactions, total] = await Promise.all([
            AIInteraction.find(filter)
                .select('type prompt parsedResponse status createdAt metadata')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            AIInteraction.countDocuments(filter)
        ]);

        return reply.code(200).send({
            success: true,
            data: {
                interactions,
                pagination: {
                    current: page,
                    total: Math.ceil(total / limit),
                    count: interactions.length,
                    totalRecords: total
                }
            }
        });

    } catch (error) {
        console.error('❌ Get AI history error:', error.message);
        return reply.code(500).send({
            success: false,
            message: error.message
        });
    }
};
