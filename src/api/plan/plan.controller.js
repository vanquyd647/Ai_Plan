const PlanService = require('../plan/plan.service');

exports.getPlans = async (req, reply) => {
    try {
        const plans = await PlanService.getAllPlans();
        return reply.code(200).send({ success: true, data: plans });
    } catch (error) {
        return reply.code(400).send({ success: false, message: error.message });
    }
};

exports.createPlan = async (req, reply) => {
    try {
        const planData = req.body;

        console.log('📝 Received plan data to save:', planData);

        // Validate required fields
        if (!planData.title && !planData.objective) {
            return reply.code(400).send({
                success: false,
                message: 'Either title or objective is required'
            });
        }

        // Kiểm tra và bổ sung trường `title` nếu cần
        if (!planData.title) {
            planData.title = planData.objective || 'Untitled Plan';
        }

        // Ensure arrays exist
        if (!planData.steps || !Array.isArray(planData.steps)) {
            planData.steps = [];
        }

        if (!planData.risks || !Array.isArray(planData.risks)) {
            planData.risks = [];
        }

        const plan = await PlanService.createPlan(planData);

        console.log('✅ Plan saved successfully:', plan._id);

        return reply.code(201).send({ 
            success: true, 
            message: 'Plan saved successfully',
            data: plan 
        });
    } catch (error) {
        console.error('❌ Error saving plan:', error.message);
        return reply.code(400).send({ 
            success: false, 
            message: error.message 
        });
    }
};

// Thêm route để save plan từ AI generated data
exports.savePlan = async (req, reply) => {
    try {
        const { planData, metadata } = req.body;

        console.log('💾 Saving AI generated plan:', planData);
        console.log('📊 With metadata:', metadata);

        if (!planData) {
            return reply.code(400).send({
                success: false,
                message: 'Plan data is required'
            });
        }

        // Add metadata to plan
        const enrichedPlanData = {
            ...planData,
            source: 'ai_generated',
            originalInput: metadata?.originalInput,
            generatedAt: metadata?.generatedAt
        };

        const savedPlan = await PlanService.createPlan(enrichedPlanData);

        return reply.code(201).send({
            success: true,
            message: 'AI generated plan saved successfully',
            data: savedPlan
        });

    } catch (error) {
        console.error('❌ Error saving AI plan:', error.message);
        return reply.code(500).send({
            success: false,
            message: error.message
        });
    }
};
