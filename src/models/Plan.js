const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    objective: {
        type: String,
        required: true,
        trim: true
    },
    steps: [{
        description: {
            type: String,
            required: true
        },
        timeline: {
            type: String,
            required: true
        },
        resources: {
            type: String,
            required: true
        }
    }],
    risks: [{
        risk: {
            type: String,
            required: true
        },
        mitigation: {
            type: String,
            required: true
        }
    }],
    // Thêm metadata cho AI generated plans
    source: {
        type: String,
        enum: ['manual', 'ai_generated'],
        default: 'manual'
    },
    originalInput: {
        type: String,
        required: false
    },
    generatedAt: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Plan', PlanSchema);
