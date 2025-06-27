const AIService = require('../ai/ai.service');
const AIPrompts = require('../ai/prompts');

exports.generatePlan = async (req, reply) => {
    try {
        const { input } = req.body;

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

        // ✅ CHỈ TRẢ VỀ PLAN DATA, KHÔNG LÀM GÌ KHÁC
        return reply.code(200).send({
            success: true,
            message: 'Plan generated successfully',
            data: planData,
            metadata: {
                generatedAt: new Date().toISOString(),
                originalInput: input
            }
        });

    } catch (error) {
        console.error('💥 Controller Error:', error.message);
        console.error('📚 Error Stack:', error.stack);
        
        return reply.code(500).send({ 
            success: false, 
            message: `Server error: ${error.message}` 
        });
    }
};

exports.getAISession = async (req, reply) => {
    try {
        const { sessionId } = req.params;
        const session = await AIService.getSessionById(sessionId);

        if (!session) {
            return reply.code(404).send({ 
                success: false, 
                message: 'Session not found' 
            });
        }

        return reply.code(200).send({
            success: true,
            data: session,
        });
    } catch (error) {
        console.error('❌ Get session error:', error.message);
        return reply.code(500).send({ 
            success: false, 
            message: error.message 
        });
    }
};
