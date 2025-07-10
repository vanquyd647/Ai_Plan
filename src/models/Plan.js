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
        trim: true,
        maxlength: 1000
    },
    
    // ✅ Plan source identification
    source: {
        type: String,
        enum: ['manual', 'ai-generated'],
        default: 'manual'
    },
    
    // ✅ AI-specific fields
    aiPrompt: {
        type: String,
        trim: true
    },
    aiModel: {
        type: String,
        trim: true
    },
    aiGeneratedAt: {
        type: Date
    },
    
    // Basic plan info
    category: {
        type: String,
        enum: ['personal', 'work', 'education', 'health', 'finance', 'travel', 'other'],
        default: 'personal'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'completed', 'archived'],
        default: 'draft'
    },
    
    // Dates
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    
    // User association
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Tasks array
    tasks: [{
        id: {
            type: String,
            default: () => new mongoose.Types.ObjectId().toString()
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },
        description: {
            type: String,
            trim: true,
            maxlength: 1000
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
        dueDate: {
            type: Date
        },
        estimatedTime: {
            type: Number,
            min: 0
        },
        actualTime: {
            type: Number,
            min: 0
        },
        tags: [{
            type: String,
            trim: true
        }],
        
        // Task assignment
        assignedTo: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            role: {
                type: String,
                enum: ['owner', 'collaborator', 'reviewer'],
                default: 'collaborator'
            },
            assignedAt: {
                type: Date,
                default: Date.now
            },
            assignedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            assignedByUser: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }],
        
        // Task comments
        comments: [{
            id: {
                type: String,
                default: () => new mongoose.Types.ObjectId().toString()
            },
            content: {
                type: String,
                required: true,
                trim: true,
                maxlength: 1000
            },
            author: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            updatedAt: {
                type: Date,
                default: Date.now
            },
            isEdited: {
                type: Boolean,
                default: false
            }
        }],
        
        // Task attachments
        attachments: [{
            fileName: String,
            fileUrl: String,
            fileSize: Number,
            fileType: String,
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
    
    // Collaborators
    collaborators: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['owner', 'editor', 'viewer'],
            default: 'viewer'
        },
        permissions: [{
            type: String,
            enum: ['view', 'edit', 'delete', 'share', 'manage_tasks', 'manage_collaborators']
        }],
        addedAt: {
            type: Date,
            default: Date.now
        },
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    
    // Plan settings
    isPublic: {
        type: Boolean,
        default: false
    },
    allowComments: {
        type: Boolean,
        default: true
    },
    allowCollaboration: {
        type: Boolean,
        default: true
    },
    
    // Tags and metadata
    tags: [{
        type: String,
        trim: true
    }],
    
    // Sharing
    shareSettings: {
        isShared: {
            type: Boolean,
            default: false
        },
        shareToken: {
            type: String
        },
        shareType: {
            type: String,
            enum: ['view', 'edit'],
            default: 'view'
        },
        expiresAt: {
            type: Date
        }
    },
    
    // Progress tracking
    progress: {
        totalTasks: {
            type: Number,
            default: 0
        },
        completedTasks: {
            type: Number,
            default: 0
        },
        percentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        }
    },
    
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// ✅ Indexes for better performance
PlanSchema.index({ userId: 1, createdAt: -1 });
PlanSchema.index({ status: 1 });
PlanSchema.index({ category: 1 });
PlanSchema.index({ priority: 1 });
PlanSchema.index({ source: 1 });
PlanSchema.index({ 'shareSettings.shareToken': 1 });
PlanSchema.index({ tags: 1 });

// ✅ Virtual for task statistics
PlanSchema.virtual('taskStats').get(function() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(task => task.status === 'completed').length;
    const inProgress = this.tasks.filter(task => task.status === 'in-progress').length;
    const todo = this.tasks.filter(task => task.status === 'todo').length;
    
    return {
        total,
        completed,
        inProgress,
        todo,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
});

// ✅ Pre-save middleware to update progress
PlanSchema.pre('save', function(next) {
    if (this.tasks && this.tasks.length > 0) {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.status === 'completed').length;
        const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        this.progress = {
            totalTasks,
            completedTasks,
            percentage
        };
    }
    
    this.updatedAt = new Date();
    next();
});

// ✅ Methods
PlanSchema.methods.addTask = function(taskData) {
    const newTask = {
        ...taskData,
        id: new mongoose.Types.ObjectId().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
    };
    this.tasks.push(newTask);
    return this.save();
};

PlanSchema.methods.updateTask = function(taskId, updateData) {
    const task = this.tasks.id(taskId);
    if (task) {
        Object.assign(task, updateData);
        task.updatedAt = new Date();
        return this.save();
    }
    return null;
};

PlanSchema.methods.deleteTask = function(taskId) {
    this.tasks.pull({ _id: taskId });
    return this.save();
};

PlanSchema.methods.addCollaborator = function(collaboratorData) {
    // Check if user is already a collaborator
    const existingCollaborator = this.collaborators.find(
        collab => collab.userId.toString() === collaboratorData.userId.toString()
    );
    
    if (!existingCollaborator) {
        this.collaborators.push(collaboratorData);
        return this.save();
    }
    return null;
};

module.exports = mongoose.model('Plan', PlanSchema);
