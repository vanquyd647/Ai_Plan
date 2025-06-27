const Plan = require('../../models/Plan');

exports.createPlan = async (planData) => {
    try {
        console.log('📝 Creating plan with data:', planData);
        
        // Validate required fields
        if (!planData.title || !planData.objective) {
            throw new Error('Title and objective are required');
        }

        const plan = new Plan(planData);
        const savedPlan = await plan.save();
        
        console.log('💾 Plan saved:', savedPlan);
        return savedPlan;
    } catch (error) {
        console.error('❌ Error creating plan:', error.message);
        throw error;
    }
};

exports.getAllPlans = async () => {
    try {
        const plans = await Plan.find();
        return plans;
    } catch (error) {
        console.error('❌ Error getting plans:', error.message);
        throw error;
    }
};
