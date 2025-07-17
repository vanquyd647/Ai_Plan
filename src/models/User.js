const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (email) {
                return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
            },
            message: 'Email không hợp lệ'
        }
    },
    password: {
        type: String,
        required: function() {
            // Chỉ yêu cầu password nếu không phải Google user
            return !this.googleId && !this.provider;
        },
        minlength: [8, 'Mật khẩu phải có ít nhất 8 ký tự'],
        validate: {
            validator: function(password) {
                // Nếu có googleId hoặc provider, không cần validate password
                if (this.googleId || this.provider === 'google') {
                    return true;
                }
                // Nếu là user thường, validate password
                return password && password.length >=8;
            },
            message: 'Mật khẩu phải có ít nhất 8 ký tự'
        }
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
    
    // ✅ Google OAuth fields - UPDATED
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },
    authProvider: {
        type: String,
        enum: ['local', 'google', 'facebook', 'github'], // Mở rộng cho tương lai
        default: 'local'
    },
    avatar: {
        type: String,
        default: null
    },
    
    // ✅ OAuth metadata - NEW
    oauthData: {
        google: {
            id: String,
            email: String,
            name: String,
            picture: String,
            verified_email: Boolean,
            locale: String,
            lastSync: Date
        },
        // Có thể mở rộng cho các provider khác
        facebook: {
            id: String,
            email: String,
            name: String,
            picture: String,
            lastSync: Date
        }
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
    
    // ✅ Enhanced login tracking - NEW
    loginHistory: [{
        timestamp: {
            type: Date,
            default: Date.now
        },
        ip: String,
        userAgent: String,
        authProvider: {
            type: String,
            enum: ['local', 'google', 'facebook', 'github'],
            default: 'local'
        },
        success: {
            type: Boolean,
            default: true
        },
        failureReason: String
    }],
    
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
        ip: String,
        authProvider: {
            type: String,
            default: 'local'
        }
    }],
    
    // 📧 Email verification
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    
    // 🔑 Password reset
    passwordResetToken: String,
    passwordResetExpires: Date,
    
    // 👤 Enhanced profile info
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
        },
        // ✅ Social links - NEW
        socialLinks: {
            google: String,
            facebook: String,
            github: String,
            linkedin: String,
            twitter: String
        }
    },
    
    // 🔒 Security settings
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: String,
    backupCodes: [String],
    
    // ✅ OAuth security settings - NEW
    oauthSecurity: {
        allowedProviders: [{
            type: String,
            enum: ['google', 'facebook', 'github']
        }],
        requireReauth: {
            type: Boolean,
            default: false
        },
        lastOAuthCheck: Date
    },
    
    // 📊 Enhanced metadata
    metadata: {
        registrationIP: String,
        registrationUserAgent: String,
        registrationProvider: {
            type: String,
            enum: ['local', 'google', 'facebook', 'github'],
            default: 'local'
        },
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
                },
                // ✅ OAuth-specific notifications - NEW
                oauthSync: {
                    type: Boolean,
                    default: true
                }
            }
        },
        // ✅ Privacy settings - NEW
        privacy: {
            profileVisibility: {
                type: String,
                enum: ['public', 'private', 'friends'],
                default: 'private'
            },
            allowOAuthDataSync: {
                type: Boolean,
                default: true
            },
            shareProfileWithOAuth: {
                type: Boolean,
                default: false
            }
        }
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.refreshTokens;
            delete ret.emailVerificationToken;
            delete ret.passwordResetToken;
            delete ret.twoFactorSecret;
            delete ret.backupCodes;
            delete ret.oauthData; // Ẩn sensitive OAuth data
            return ret;
        }
    }
});

// 🔒 Virtual for account lock status
UserSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ✅ Virtual for OAuth status - NEW
UserSchema.virtual('hasOAuthAccounts').get(function () {
    return !!(this.googleId || this.oauthData?.facebook?.id);
});

UserSchema.virtual('oauthProviders').get(function () {
    const providers = [];
    if (this.googleId) providers.push('google');
    if (this.oauthData?.facebook?.id) providers.push('facebook');
    return providers;
});

// 📊 Optimized indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastLogin: -1 });
UserSchema.index({ isActive: 1, isVerified: 1 });
UserSchema.index({ lockUntil: 1 }, { sparse: true });
UserSchema.index({ 'refreshTokens.token': 1 }, { sparse: true });
UserSchema.index({ 'refreshTokens.expiresAt': 1 }, { sparse: true });
UserSchema.index({ emailVerificationToken: 1 }, { sparse: true });
UserSchema.index({ passwordResetToken: 1 }, { sparse: true });
UserSchema.index({ role: 1 });

// ✅ OAuth-specific indexes - NEW
UserSchema.index({ googleId: 1 }, { sparse: true });
UserSchema.index({ authProvider: 1 });
UserSchema.index({ 'oauthData.google.id': 1 }, { sparse: true });
UserSchema.index({ 'loginHistory.timestamp': -1 });
UserSchema.index({ 'loginHistory.authProvider': 1 });

// 🔐 Pre-save middleware to hash password
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// 🔑 Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// ✅ Enhanced refresh token method with OAuth support - UPDATED
UserSchema.methods.addRefreshToken = function (token, expiresAt, userAgent, ip, authProvider = 'local') {
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
        ip: ip || 'Unknown',
        authProvider
    });

    return this.save();
};

// 🗑️ Method to remove refresh token
UserSchema.methods.removeRefreshToken = function (token) {
    this.refreshTokens = this.refreshTokens.filter(
        rt => rt.token !== token
    );
    return this.save();
};

// 🧹 Method to remove all refresh tokens (logout from all devices)
UserSchema.methods.removeAllRefreshTokens = function () {
    this.refreshTokens = [];
    return this.save();
};

// 🔍 Method to find refresh token
UserSchema.methods.findRefreshToken = function (token) {
    return this.refreshTokens.find(rt => rt.token === token && rt.expiresAt > new Date());
};

// ✅ Enhanced login tracking - NEW
UserSchema.methods.recordLogin = function (ip, userAgent, authProvider = 'local', success = true, failureReason = null) {
    // Limit login history to last 50 entries
    if (this.loginHistory.length >= 50) {
        this.loginHistory = this.loginHistory.slice(-49);
    }

    this.loginHistory.push({
        timestamp: new Date(),
        ip: ip || 'Unknown',
        userAgent: userAgent || 'Unknown',
        authProvider,
        success,
        failureReason
    });

    if (success) {
        this.lastLogin = new Date();
        this.lastLoginIP = ip;
    }

    return this.save();
};

// 🔒 Method to increment login attempts
UserSchema.methods.incLoginAttempts = function () {
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
UserSchema.methods.resetLoginAttempts = function () {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
    });
};

// ✅ Google OAuth specific methods - NEW

// Find or create user from Google profile
UserSchema.statics.findOrCreateGoogleUser = async function (profile, clientInfo = {}) {
    try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
            throw new Error('Email không có trong profile Google');
        }

        console.log('Google Profile received:', {
            id: profile.id,
            email: email,
            name: profile.displayName,
            picture: profile.photos?.[0]?.value
        });

        // Tìm user theo Google ID hoặc email
        let user = await this.findOne({
            $or: [
                { googleId: profile.id },
                { email: email.toLowerCase() }
            ]
        });

        if (user) {
            // Nếu user tồn tại nhưng chưa có googleId, liên kết tài khoản
            if (!user.googleId) {
                user.googleId = profile.id;
                user.authProvider = 'google';
                user.isVerified = true; // Google users are pre-verified
            }

            // Cập nhật OAuth data
            user.oauthData = user.oauthData || {};
            user.oauthData.google = {
                id: profile.id,
                email: email,
                name: profile.displayName,
                picture: profile.photos?.[0]?.value,
                verified_email: profile.emails?.[0]?.verified || true,
                locale: profile._json?.locale || 'vi',
                lastSync: new Date()
            };

            // Cập nhật avatar nếu chưa có
            if (!user.avatar && profile.photos?.[0]?.value) {
                user.avatar = profile.photos[0].value;
                user.profile = user.profile || {};
                user.profile.avatar = profile.photos[0].value;
            }

            await user.save();
            console.log('Updated existing user with Google OAuth');
            return user;
        }

        // Tạo user mới
        user = new this({
            googleId: profile.id,
            email: email.toLowerCase(),
            name: profile.displayName || profile.name?.givenName || 'Google User',
            authProvider: 'google',
            avatar: profile.photos?.[0]?.value,
            isVerified: true, // Google users are pre-verified
            isActive: true,
            
            // OAuth data
            oauthData: {
                google: {
                    id: profile.id,
                    email: email,
                    name: profile.displayName,
                    picture: profile.photos?.[0]?.value,
                    verified_email: profile.emails?.[0]?.verified || true,
                    locale: profile._json?.locale || 'vi',
                    lastSync: new Date()
                }
            },

            // Profile data
            profile: {
                firstName: profile.name?.givenName,
                lastName: profile.name?.familyName,
                avatar: profile.photos?.[0]?.value
            },

            // Metadata
            metadata: {
                registrationIP: clientInfo.ip || 'OAuth-Request',
                registrationUserAgent: clientInfo.userAgent || 'Google-OAuth',
                registrationProvider: 'google',
                preferences: {
                    language: profile._json?.locale?.split('-')[0] || 'vi',
                    theme: 'light',
                    notifications: {
                        email: true,
                        push: true,
                        oauthSync: true
                    }
                },
                privacy: {
                    profileVisibility: 'private',
                    allowOAuthDataSync: true,
                    shareProfileWithOAuth: false
                }
            },

            // OAuth security
            oauthSecurity: {
                allowedProviders: ['google'],
                requireReauth: false,
                lastOAuthCheck: new Date()
            }
        });

        await user.save();
        console.log('Created new Google user:', user.email);
        return user;

    } catch (error) {
        console.error('Error in findOrCreateGoogleUser:', error);
        throw error;
    }
};

// Link Google account to existing user
UserSchema.methods.linkGoogleAccount = async function (googleProfile) {
    try {
        // Check if Google account is already linked to another user
        const existingUser = await this.constructor.findOne({
            googleId: googleProfile.id,
            _id: { $ne: this._id }
        });

        if (existingUser) {
            throw new Error('Tài khoản Google này đã được liên kết với user khác');
        }

        // Link Google account
        this.googleId = googleProfile.id;
        
        // Update OAuth data
        this.oauthData = this.oauthData || {};
        this.oauthData.google = {
            id: googleProfile.id,
            email: googleProfile.emails?.[0]?.value,
            name: googleProfile.displayName,
            picture: googleProfile.photos?.[0]?.value,
            verified_email: googleProfile.emails?.[0]?.verified || true,
            locale: googleProfile._json?.locale || 'vi',
            lastSync: new Date()
        };

        // Update avatar if not set
        if (!this.avatar && googleProfile.photos?.[0]?.value) {
            this.avatar = googleProfile.photos[0].value;
            this.profile = this.profile || {};
            this.profile.avatar = googleProfile.photos[0].value;
        }

        // Update OAuth security settings
        this.oauthSecurity = this.oauthSecurity || {};
        this.oauthSecurity.allowedProviders = this.oauthSecurity.allowedProviders || [];
        if (!this.oauthSecurity.allowedProviders.includes('google')) {
            this.oauthSecurity.allowedProviders.push('google');
        }
        this.oauthSecurity.lastOAuthCheck = new Date();

        await this.save();
        return this;

    } catch (error) {
        console.error('Error linking Google account:', error);
        throw error;
    }
};

// Unlink Google account
UserSchema.methods.unlinkGoogleAccount = async function () {
    try {
        // Ensure user has password if this is their primary auth method
        if (this.authProvider === 'google' && !this.password) {
            throw new Error('Vui lòng đặt mật khẩu trước khi hủy liên kết Google');
        }

        // Remove Google data
        this.googleId = undefined;
        if (this.oauthData?.google) {
            this.oauthData.google = undefined;
        }

        // Update auth provider if needed
        if (this.authProvider === 'google') {
            this.authProvider = 'local';
        }

        // Update OAuth security settings
        if (this.oauthSecurity?.allowedProviders) {
            this.oauthSecurity.allowedProviders = this.oauthSecurity.allowedProviders.filter(
                provider => provider !== 'google'
            );
        }

        await this.save();
        return this;

    } catch (error) {
        console.error('Error unlinking Google account:', error);
        throw error;
    }
};

// Sync Google profile data
UserSchema.methods.syncGoogleProfile = async function (googleProfile) {
    try {
        if (!this.googleId || this.googleId !== googleProfile.id) {
            throw new Error('Google account not linked to this user');
        }

        // Update OAuth data
        this.oauthData = this.oauthData || {};
        this.oauthData.google = {
            ...this.oauthData.google,
            email: googleProfile.emails?.[0]?.value,
            name: googleProfile.displayName,
            picture: googleProfile.photos?.[0]?.value,
            verified_email: googleProfile.emails?.[0]?.verified || true,
            locale: googleProfile._json?.locale || 'vi',
            lastSync: new Date()
        };

        // Update profile if allowed
        if (this.metadata?.privacy?.allowOAuthDataSync) {
            // Update name if not manually changed
            if (!this.profile?.manuallyUpdated) {
                this.name = googleProfile.displayName || this.name;
                this.profile = this.profile || {};
                this.profile.firstName = googleProfile.name?.givenName || this.profile.firstName;
                this.profile.lastName = googleProfile.name?.familyName || this.profile.lastName;
            }

            // Update avatar if not manually set
            if (!this.profile?.avatarManuallySet && googleProfile.photos?.[0]?.value) {
                this.avatar = googleProfile.photos[0].value;
                this.profile.avatar = googleProfile.photos[0].value;
            }
        }

        this.oauthSecurity = this.oauthSecurity || {};
        this.oauthSecurity.lastOAuthCheck = new Date();

        await this.save();
        return this;

    } catch (error) {
        console.error('Error syncing Google profile:', error);
        throw error;
    }
};

// 📧 Method to generate email verification token
UserSchema.methods.generateEmailVerificationToken = function () {
    const token = crypto.randomBytes(32).toString('hex');

    this.emailVerificationToken = token;
    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    return token;
};

// 🔑 Method to generate password reset token
UserSchema.methods.generatePasswordResetToken = function () {
    const token = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = token;
    this.passwordResetExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    return token;
};

// 🧹 Static method to clean expired tokens
UserSchema.statics.cleanExpiredTokens = function () {
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

// ✅ Enhanced user stats with OAuth data - UPDATED
UserSchema.statics.getStats = function () {
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
                },
                // OAuth stats
                googleUsers: {
                    $sum: {
                        $cond: [{ $ne: ['$googleId', null] }, 1, 0]
                    }
                },
                localUsers: {
                    $sum: {
                        $cond: [{ $eq: ['$authProvider', 'local'] }, 1, 0]
                    }
                },
                oauthUsers: {
                    $sum: {
                        $cond: [{ $ne: ['$authProvider', 'local'] }, 1, 0]
                    }
                }
            }
        }
    ]);
};

// 🔍 Static method to find user by email (case insensitive)
UserSchema.statics.findByEmail = function (email) {
    return this.findOne({
        email: email.toLowerCase().trim()
    });
};

// 🔍 Static method to find active users
UserSchema.statics.findActiveUsers = function (limit = 50) {
    return this.find({
        isActive: true
    })
        .sort({ lastLogin: -1 })
        .limit(limit)
        .select('-password -refreshTokens');
};

// 🧹 Static method to cleanup inactive unverified accounts (older than 7 days)
UserSchema.statics.cleanupUnverifiedAccounts = function () {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return this.deleteMany({
        isVerified: false,
        createdAt: { $lt: sevenDaysAgo },
        authProvider: 'local' // Only cleanup local accounts, keep OAuth accounts
    });
};

// ✅ Enhanced login statistics with OAuth breakdown - UPDATED
UserSchema.statics.getLoginStats = function (days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.aggregate([
        {
            $unwind: '$loginHistory'
        },
        {
            $match: {
                'loginHistory.timestamp': { $gte: startDate },
                'loginHistory.success': true
            }
        },
        {
            $group: {
                _id: {
                    date: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$loginHistory.timestamp"
                        }
                    },
                    provider: '$loginHistory.authProvider'
                },
                loginCount: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: '$_id.date',
                totalLogins: { $sum: '$loginCount' },
                providers: {
                    $push: {
                        provider: '$_id.provider',
                        count: '$loginCount'
                    }
                }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);
};

// ✅ OAuth-specific static methods - NEW

// Find users by OAuth provider
UserSchema.statics.findByOAuthProvider = function (provider, limit = 50) {
    const query = {};
    if (provider === 'google') {
        query.googleId = { $exists: true, $ne: null };
    }
    
    return this.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('-password -refreshTokens -oauthData');
};

// Get OAuth statistics
UserSchema.statics.getOAuthStats = function () {
    return this.aggregate([
        {
            $group: {
                _id: '$authProvider',
                count: { $sum: 1 },
                verified: {
                    $sum: {
                        $cond: [{ $eq: ['$isVerified', true] }, 1, 0]
                    }
                },
                active: {
                    $sum: {
                        $cond: [{ $eq: ['$isActive', true] }, 1, 0]
                    }
                }
            }
        },
        {
            $sort: { count: -1 }
        }
    ]);
};

// Sync OAuth data for all users (maintenance task)
UserSchema.statics.syncOAuthData = async function () {
    const users = await this.find({
        $or: [
            { googleId: { $exists: true, $ne: null } }
        ]
    });

    const results = {
        total: users.length,
        synced: 0,
        errors: []
    };

    for (const user of users) {
        try {
            if (user.oauthSecurity?.allowOAuthDataSync !== false) {
                // Here you would implement actual OAuth data refresh
                // This is a placeholder for the sync logic
                user.oauthSecurity = user.oauthSecurity || {};
                user.oauthSecurity.lastOAuthCheck = new Date();
                await user.save();
                results.synced++;
            }
        } catch (error) {
            results.errors.push({
                userId: user._id,
                error: error.message
            });
        }
    }

    return results;
};

module.exports = mongoose.model('User', UserSchema);
