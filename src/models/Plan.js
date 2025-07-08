const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        default: 'General'
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'completed', 'archived'],
        default: 'draft'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    tags: [{
        type: String,
        trim: true
    }],
    
    // ✅ Steps structure for AI plans
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
    
    // ✅ Risks structure for AI plans
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
    
    // ✅ Keep tasks for manual plans (optional)
    tasks: [{
        title: String,
        description: String,
        status: {
            type: String,
            enum: ['todo', 'in_progress', 'completed'],
            default: 'todo'
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium'
        },
        dueDate: Date,
        estimatedHours: Number,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdBy: {
        type: String,
        enum: ['user', 'ai'],
        default: 'user'
    },
    
    // ✅ AI metadata
    aiMetadata: {
        prompt: String,
        model: String,
        generatedAt: Date,
        confidence: Number,
        originalData: mongoose.Schema.Types.Mixed
    },
    
    startDate: Date,
    endDate: Date,
    budget: Number
}, {
    timestamps: true
});

// Indexes
PlanSchema.index({ userId: 1, createdAt: -1 });
PlanSchema.index({ userId: 1, status: 1 });
PlanSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Plan', PlanSchema);
