// models/Group.js
const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    avatar: {
        type: String,
        default: null
    },

    // Owner của nhóm
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Thành viên nhóm
    members: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['owner', 'admin', 'member', 'viewer'],
            default: 'member'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        permissions: {
            canCreatePlans: { type: Boolean, default: true },
            canEditPlans: { type: Boolean, default: true },
            canDeletePlans: { type: Boolean, default: false },
            canInviteMembers: { type: Boolean, default: false },
            canManageMembers: { type: Boolean, default: false }
        }
    }],

    // Lời mời chờ xử lý
    pendingInvitations: [{
        email: {
            type: String,
            required: true,
            lowercase: true
        },
        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['admin', 'member', 'viewer'],
            default: 'member'
        },
        token: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Date,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Cài đặt nhóm
    settings: {
        visibility: {
            type: String,
            enum: ['public', 'private', 'invite-only'],
            default: 'private'
        },
        allowMemberInvite: {
            type: Boolean,
            default: false
        },
        requireApproval: {
            type: Boolean,
            default: true
        },
        planVisibility: {
            type: String,
            enum: ['all-members', 'admins-only', 'custom'],
            default: 'all-members'
        }
    },

    // Thống kê
    stats: {
        totalPlans: { type: Number, default: 0 },
        activePlans: { type: Number, default: 0 },
        completedPlans: { type: Number, default: 0 },
        totalTasks: { type: Number, default: 0 }
    },

    // Trạng thái
    isActive: {
        type: Boolean,
        default: true
    },

    // Tags cho nhóm
    tags: [{
        type: String,
        trim: true
    }],

    // Metadata
    metadata: {
        createdIP: String,
        lastActivity: {
            type: Date,
            default: Date.now
        }
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Virtuals
GroupSchema.virtual('memberCount').get(function () {
    return this.members ? this.members.length : 0;
});

GroupSchema.virtual('adminCount').get(function () {
    return this.members ? this.members.filter(m => m.role === 'admin' || m.role === 'owner').length : 0;
});

// Indexes
GroupSchema.index({ owner: 1 });
GroupSchema.index({ 'members.userId': 1 });
GroupSchema.index({ name: 'text', description: 'text' });
GroupSchema.index({ createdAt: -1 });
GroupSchema.index({ 'settings.visibility': 1 });
GroupSchema.index({ isActive: 1 });
GroupSchema.index({ 'pendingInvitations.email': 1 });
GroupSchema.index({ 'pendingInvitations.token': 1 });

// Methods
GroupSchema.methods.isMember = function (userId) {
    return this.members.some(member => member.userId.toString() === userId.toString());
};

GroupSchema.methods.getMemberRole = function (userId) {
    const member = this.members.find(member => member.userId.toString() === userId.toString());
    return member ? member.role : null;
};

GroupSchema.methods.hasPermission = function (userId, permission) {
    const member = this.members.find(member => member.userId.toString() === userId.toString());
    if (!member) return false;

    if (member.role === 'owner') return true;
    if (member.role === 'admin' && permission !== 'canManageMembers') return true;

    return member.permissions[permission] || false;
};

module.exports = mongoose.model('Group', GroupSchema);
