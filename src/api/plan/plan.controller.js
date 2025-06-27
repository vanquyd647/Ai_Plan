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

        // Kiểm tra và bổ sung trường `title` nếu cần
        if (!planData.title) {
            planData.title = planData.objective || 'Untitled Plan'; // Sử dụng objective làm title nếu có
        }

        const plan = await PlanService.createPlan(planData);

        return reply.code(200).send({ success: true, data: plan });
    } catch (error) {
        return reply.code(400).send({ success: false, message: error.message });
    }
};

