const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true, // ✅ Giữ unique nhưng bỏ index: true
        lowercase: true,
        trim: true,
        validate: {
            validator: function(email) {
                return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
            },
            message: 'Email không hợp lệ'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    // 🔐 Security fields
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    },
    lastLogin: {
        type: Date
    },
    lastLoginIP: {
        type: String
    },
    // 🔄 Refresh tokens array
    refreshTokens: [{
        token: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        expiresAt: {
            type: Date,
            required: true
        },
        userAgent: String,
        ip: String
    }],
    // 📧 Email verification
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    // 🔑 Password reset
    passwordResetToken: String,
    passwordResetExpires: Date,
    // 👤 Profile info
    profile: {
        firstName: String,
        lastName: String,
        avatar: String,
        bio: String,
        phone: String,
        dateOfBirth: Date,
        gender: {
            type: String,
            enum: ['male', 'female', 'other']
        }
    },
    // 🔒 Security settings
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: String,
    backupCodes: [String],
    // 📊 Metadata
    metadata: {
        registrationIP: String,
        registrationUserAgent: String,
        preferences: {
            language: {
                type: String,
                default: 'vi'
            },
            theme: {
                type: String,
                enum: ['light', 'dark', 'auto'],
                default: 'light'
            },
            notifications: {
                email: {
                    type: Boolean,
                    default: true
                },
                push: {
                    type: Boolean,
                    default: true
                }
            }
        }
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.refreshTokens;
            delete ret.emailVerificationToken;
            delete ret.passwordResetToken;
            delete ret.twoFactorSecret;
            delete ret.backupCodes;
            return ret;
        }
    }
});

// 🔒 Virtual for account lock status
UserSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// 📊 Optimized indexes for performance
UserSchema.index({ email: 1 }); // ✅ Primary email index
UserSchema.index({ createdAt: -1 }); // For sorting by registration date
UserSchema.index({ lastLogin: -1 }); // For active user queries
UserSchema.index({ isActive: 1, isVerified: 1 }); // Compound index for user status
UserSchema.index({ lockUntil: 1 }, { sparse: true }); // Sparse index for locked accounts
UserSchema.index({ 'refreshTokens.token': 1 }, { sparse: true }); // For token lookup
UserSchema.index({ 'refreshTokens.expiresAt': 1 }, { sparse: true }); // For cleanup
UserSchema.index({ emailVerificationToken: 1 }, { sparse: true }); // For email verification
UserSchema.index({ passwordResetToken: 1 }, { sparse: true }); // For password reset
UserSchema.index({ role: 1 }); // For role-based queries

// 🔐 Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// 🔑 Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// 🔄 Method to add refresh token
UserSchema.methods.addRefreshToken = function(token, expiresAt, userAgent, ip) {
    // Remove expired tokens first
    this.refreshTokens = this.refreshTokens.filter(
        rt => rt.expiresAt > new Date()
    );
    
    // Limit number of refresh tokens per user (max 5 active sessions)
    if (this.refreshTokens.length >= 5) {
        // Remove oldest token
        this.refreshTokens.sort((a, b) => a.createdAt - b.createdAt);
        this.refreshTokens.shift();
    }
    
    // Add new refresh token
    this.refreshTokens.push({
        token,
        expiresAt,
        userAgent: userAgent || 'Unknown',
        ip: ip || 'Unknown'
    });
    
    return this.save();
};

// 🗑️ Method to remove refresh token
UserSchema.methods.removeRefreshToken = function(token) {
    this.refreshTokens = this.refreshTokens.filter(
        rt => rt.token !== token
    );
    return this.save();
};

// 🧹 Method to remove all refresh tokens (logout from all devices)
UserSchema.methods.removeAllRefreshTokens = function() {
    this.refreshTokens = [];
    return this.save();
};

// 🔍 Method to find refresh token
UserSchema.methods.findRefreshToken = function(token) {
    return this.refreshTokens.find(rt => rt.token === token && rt.expiresAt > new Date());
};

// 🔒 Method to increment login attempts
UserSchema.methods.incLoginAttempts = function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },
            $set: { loginAttempts: 1 }
        });
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock account after 5 failed attempts for 30 minutes
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 }; // 30 minutes
    }
    
    return this.updateOne(updates);
};

// ✅ Method to reset login attempts
UserSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
    });
};

// 📧 Method to generate email verification token
UserSchema.methods.generateEmailVerificationToken = function() {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    
    this.emailVerificationToken = token;
    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    return token;
};

// 🔑 Method to generate password reset token
UserSchema.methods.generatePasswordResetToken = function() {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    
    this.passwordResetToken = token;
    this.passwordResetExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
    
    return token;
};

// 🧹 Static method to clean expired tokens
UserSchema.statics.cleanExpiredTokens = function() {
    return this.updateMany(
        {},
        {
            $pull: {
                refreshTokens: {
                    expiresAt: { $lt: new Date() }
                }
            }
        }
    );
};

// 📊 Static method to get user stats
UserSchema.statics.getStats = function() {
    return this.aggregate([
        {
            $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                activeUsers: {
                    $sum: {
                        $cond: [{ $eq: ['$isActive', true] }, 1, 0]
                    }
                },
                verifiedUsers: {
                    $sum: {
                        $cond: [{ $eq: ['$isVerified', true] }, 1, 0]
                    }
                },
                lockedUsers: {
                    $sum: {
                        $cond: [
                            { $gt: ['$lockUntil', new Date()] },
                            1,
                            0
                        ]
                    }
                }
            }
        }
    ]);
};

// 🔍 Static method to find user by email (case insensitive)
UserSchema.statics.findByEmail = function(email) {
    return this.findOne({ 
        email: email.toLowerCase().trim() 
    });
};

// 🔍 Static method to find active users
UserSchema.statics.findActiveUsers = function(limit = 50) {
    return this.find({ 
        isActive: true 
    })
    .sort({ lastLogin: -1 })
    .limit(limit)
    .select('-password -refreshTokens');
};

// 🧹 Static method to cleanup inactive unverified accounts (older than 7 days)
UserSchema.statics.cleanupUnverifiedAccounts = function() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return this.deleteMany({
        isVerified: false,
        createdAt: { $lt: sevenDaysAgo }
    });
};

// 📊 Static method to get login statistics
UserSchema.statics.getLoginStats = function(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.aggregate([
        {
            $match: {
                lastLogin: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$lastLogin"
                    }
                },
                loginCount: { $sum: 1 }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);
};

module.exports = mongoose.model('User', UserSchema);
