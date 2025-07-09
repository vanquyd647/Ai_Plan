// models/Plan.js
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
    
    // ✅ NEW: Group support
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        default: null // null = personal plan
    },
    
    // ✅ ENHANCED: Tasks with assignment support
    tasks: [{
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            enum: ['todo', 'in-progress', 'review', 'completed'],
            default: 'todo'
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium'
        },
        
        // ✅ NEW: Task assignments
        assignedTo: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            assignedAt: {
                type: Date,
                default: Date.now
            },
            assignedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            role: {
                type: String,
                enum: ['owner', 'collaborator', 'reviewer'],
                default: 'collaborator'
            }
        }],
        
        // ✅ NEW: Task timeline
        startDate: Date,
        dueDate: Date,
        estimatedHours: Number,
        actualHours: Number,
        
        // ✅ NEW: Task dependencies
        dependencies: [{
            taskId: {
                type: mongoose.Schema.Types.ObjectId
            },
            type: {
                type: String,
                enum: ['finish-to-start', 'start-to-start', 'finish-to-finish'],
                default: 'finish-to-start'
            }
        }],
        
        // ✅ NEW: Task comments
        comments: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            content: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            type: {
                type: String,
                enum: ['comment', 'status-update', 'assignment'],
                default: 'comment'
            }
        }],
        
        // ✅ NEW: File attachments
        attachments: [{
            fileName: String,
            fileUrl: String,
            fileSize: Number,
            uploadedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }],
        
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // ✅ NEW: Plan collaborators
    collaborators: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['owner', 'editor', 'viewer', 'reviewer'],
            default: 'viewer'
        },
        permissions: {
            canEdit: { type: Boolean, default: false },
            canAssignTasks: { type: Boolean, default: false },
            canDeleteTasks: { type: Boolean, default: false },
            canInviteOthers: { type: Boolean, default: false },
            canViewReports: { type: Boolean, default: true }
        },
        addedAt: {
            type: Date,
            default: Date.now
        },
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    
    // ✅ NEW: Progress tracking
    progress: {
        totalTasks: { type: Number, default: 0 },
        completedTasks: { type: Number, default: 0 },
        inProgressTasks: { type: Number, default: 0 },
        overdueTasks: { type: Number, default: 0 },
        percentComplete: { type: Number, default: 0 }
    },
    
    // Existing fields
    steps: [{
        description: String,
        timeline: String,
        resources: String
    }],
    risks: [{
        risk: String,
        mitigation: String
    }],
    
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdBy: {
        type: String,
        default: 'user'
    },
    aiMetadata: {
        model: String,
        prompt: String,
        generatedAt: Date,
        confidence: Number
    }
}, {
    timestamps: true
});

// ✅ Indexes for performance
PlanSchema.index({ userId: 1, status: 1 });
PlanSchema.index({ groupId: 1, status: 1 });
PlanSchema.index({ 'tasks.assignedTo.userId': 1 });
PlanSchema.index({ 'collaborators.userId': 1 });
PlanSchema.index({ 'tasks.dueDate': 1, 'tasks.status': 1 });

// ✅ Pre-save middleware to update progress
PlanSchema.pre('save', function(next) {
    if (this.tasks && this.tasks.length > 0) {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(t => t.status === 'completed').length;
        const inProgressTasks = this.tasks.filter(t => t.status === 'in-progress').length;
        const overdueTasks = this.tasks.filter(t => 
            t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
        ).length;
        
        this.progress = {
            totalTasks,
            completedTasks,
            inProgressTasks,
            overdueTasks,
            percentComplete: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        };
    }
    next();
});

module.exports = mongoose.model('Plan', PlanSchema);
