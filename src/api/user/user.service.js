const User = require('../../models/User');

// Helper functions
const calculateProfileCompleteness = (user) => {
    let score = 0;
    const fields = ['name', 'email', 'avatar', 'preferences', 'isVerified'];
    fields.forEach(field => {
        if (user[field]) score += 20;
    });
    return Math.min(score, 100);
};

const calculateSecurityScore = (user) => {
    let score = 0;
    if (user.isVerified) score += 30;
    if (user.twoFactorAuth?.enabled) score += 40;
    if (user.authProvider === 'google') score += 20;
    if (user.password) score += 10; // Has password set
    return Math.min(score, 100);
};

exports.getUserById = async (userId) => {
    try {
        const user = await User.findById(userId)
            .select('-password -refreshTokens -emailVerificationToken -passwordResetToken -passwordResetExpires -emailVerificationExpires -loginAttempts -lockUntil -twoFactorAuth.secret -twoFactorAuth.backupCodes')
            .lean();

        if (!user) {
            throw new Error('Người dùng không tồn tại');
        }

        // ✅ Format response với nhiều thông tin hơn
        const userProfile = {
            // Basic info
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,

            // Account status
            isActive: user.isActive,
            isVerified: user.isVerified,

            // Authentication info
            authProvider: user.authProvider,
            googleId: user.googleId ? '***' : null, // Ẩn sensitive data

            // OAuth data (safe fields only)
            oauthData: user.oauthData ? {
                google: user.oauthData.google ? {
                    name: user.oauthData.google.name,
                    picture: user.oauthData.google.picture,
                    verified_email: user.oauthData.google.verified_email,
                    locale: user.oauthData.google.locale,
                    lastSync: user.oauthData.google.lastSync
                } : null,
                facebook: user.oauthData.facebook ? {
                    name: user.oauthData.facebook.name,
                    picture: user.oauthData.facebook.picture,
                    lastSync: user.oauthData.facebook.lastSync
                } : null
            } : null,

            // Login info
            lastLogin: user.lastLogin,
            lastLoginIP: user.lastLoginIP ?
                user.lastLoginIP.replace(/(\d+\.\d+\.\d+)\.\d+/, '$1.***') : null,

            // Recent login history (last 5 logins)
            recentLogins: user.loginHistory ?
                user.loginHistory
                    .slice(-5)
                    .map(login => ({
                        timestamp: login.timestamp,
                        authProvider: login.authProvider,
                        success: login.success,
                        ip: login.ip ? login.ip.replace(/(\d+\.\d+\.\d+)\.\d+/, '$1.***') : null,
                        userAgent: login.userAgent ? login.userAgent.substring(0, 50) + '...' : null,
                        location: login.location || null
                    })) : [],

            // Account stats
            stats: {
                totalLogins: user.loginHistory ? user.loginHistory.length : 0,
                successfulLogins: user.loginHistory ?
                    user.loginHistory.filter(login => login.success).length : 0,
                failedLogins: user.loginHistory ?
                    user.loginHistory.filter(login => !login.success).length : 0,
                activeRefreshTokens: user.refreshTokens ?
                    user.refreshTokens.filter(token => token.expiresAt > new Date()).length : 0,
                accountAge: user.createdAt ?
                    Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) : 0
            },

            // User preferences
            preferences: user.preferences || {
                language: 'vi',
                theme: 'light',
                timezone: 'Asia/Ho_Chi_Minh',
                emailNotifications: true,
                pushNotifications: true
            },

            // Notification settings
            notifications: user.notifications || {
                email: true,
                push: true,
                sms: false,
                marketing: false
            },

            // Privacy settings
            privacy: user.privacy || {
                profileVisibility: 'public',
                showEmail: false,
                showLastLogin: false,
                allowSearchEngines: true
            },

            // Two-factor authentication (safe info only)
            twoFactorAuth: {
                enabled: user.twoFactorAuth?.enabled || false,
                method: user.twoFactorAuth?.method || null,
                hasBackupCodes: user.twoFactorAuth?.backupCodes ?
                    user.twoFactorAuth.backupCodes.length > 0 : false
            },

            // Timestamps
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,

            // Additional metadata
            metadata: {
                profileCompleteness: calculateProfileCompleteness(user),
                securityScore: calculateSecurityScore(user),
                lastActivity: user.lastLogin || user.updatedAt
            }
        };

        return userProfile;
    } catch (error) {
        console.error('Get user profile error:', error);
        throw error;
    }
};

// ✅ NEW: Get user settings
exports.getUserSettings = async (userId) => {
    try {
        const user = await User.findById(userId)
            .select('preferences notifications privacy twoFactorAuth.enabled twoFactorAuth.method')
            .lean();

        if (!user) {
            throw new Error('Người dùng không tồn tại');
        }

        return {
            preferences: user.preferences || {
                language: 'vi',
                theme: 'light',
                timezone: 'Asia/Ho_Chi_Minh',
                dateFormat: 'DD/MM/YYYY',
                timeFormat: '24h',
                emailNotifications: true,
                pushNotifications: true,
                smsNotifications: false,
                marketingEmails: false
            },
            notifications: user.notifications || {
                email: true,
                push: true,
                sms: false,
                marketing: false,
                security: true,
                updates: true
            },
            privacy: user.privacy || {
                profileVisibility: 'public',
                showEmail: false,
                showLastLogin: false,
                showOnlineStatus: true,
                allowSearchEngines: true,
                allowDataCollection: false
            },
            twoFactorAuth: {
                enabled: user.twoFactorAuth?.enabled || false,
                method: user.twoFactorAuth?.method || null
            }
        };
    } catch (error) {
        console.error('Get user settings error:', error);
        throw error;
    }
};

// ✅ NEW: Get user security info
exports.getUserSecurity = async (userId) => {
    try {
        const user = await User.findById(userId)
            .select('loginHistory refreshTokens lastLogin lastLoginIP isVerified twoFactorAuth.enabled createdAt authProvider')
            .lean();

        if (!user) {
            throw new Error('Người dùng không tồn tại');
        }

        const now = new Date();
        const activeSessions = user.refreshTokens ?
            user.refreshTokens.filter(token => token.expiresAt > now) : [];

        return {
            // Account security status
            securityStatus: {
                isVerified: user.isVerified,
                twoFactorEnabled: user.twoFactorAuth?.enabled || false,
                authProvider: user.authProvider,
                securityScore: calculateSecurityScore(user)
            },

            // Recent activity
            lastLogin: user.lastLogin,
            lastLoginIP: user.lastLoginIP ?
                user.lastLoginIP.replace(/(\d+\.\d+\.\d+)\.\d+/, '$1.***') : null,

            // Active sessions
            activeSessions: activeSessions.map(token => ({
                id: token._id,
                createdAt: token.createdAt,
                expiresAt: token.expiresAt,
                userAgent: token.userAgent,
                ip: token.ip ? token.ip.replace(/(\d+\.\d+\.\d+)\.\d+/, '$1.***') : null,
                authProvider: token.authProvider,
                isCurrentSession: false // Would need to check against current token
            })),

            // Login history (last 10)
            loginHistory: user.loginHistory ?
                user.loginHistory
                    .slice(-10)
                    .reverse()
                    .map(login => ({
                        timestamp: login.timestamp,
                        authProvider: login.authProvider,
                        success: login.success,
                        failureReason: login.failureReason,
                        ip: login.ip ? login.ip.replace(/(\d+\.\d+\.\d+)\.\d+/, '$1.***') : null,
                        userAgent: login.userAgent ? login.userAgent.substring(0, 50) + '...' : null,
                        location: login.location || null
                    })) : [],

            // Security recommendations
            recommendations: generateSecurityRecommendations(user)
        };
    } catch (error) {
        console.error('Get user security error:', error);
        throw error;
    }
};

// ✅ NEW: Update user profile
exports.updateUserProfile = async (userId, updates) => {
    try {
        // Chỉ cho phép update một số field nhất định
        const allowedUpdates = ['name', 'avatar', 'preferences', 'notifications', 'privacy'];
        const filteredUpdates = {};

        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                filteredUpdates[key] = updates[key];
            }
        });

        if (Object.keys(filteredUpdates).length === 0) {
            throw new Error('Không có dữ liệu hợp lệ để cập nhật');
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { ...filteredUpdates, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).select('-password -refreshTokens -emailVerificationToken -passwordResetToken -twoFactorAuth.secret -twoFactorAuth.backupCodes');

        return updatedUser;
    } catch (error) {
        console.error('Update user profile error:', error);
        throw error;
    }
};

// Helper function for security recommendations
const generateSecurityRecommendations = (user) => {
    const recommendations = [];

    if (!user.isVerified) {
        recommendations.push({
            type: 'verification',
            priority: 'high',
            message: 'Xác minh email để tăng cường bảo mật tài khoản'
        });
    }

    if (!user.twoFactorAuth?.enabled) {
        recommendations.push({
            type: '2fa',
            priority: 'medium',
            message: 'Bật xác thực hai yếu tố để bảo vệ tài khoản tốt hơn'
        });
    }

    // Check for suspicious login patterns
    if (user.loginHistory && user.loginHistory.length > 0) {
        const recentFailures = user.loginHistory
            .slice(-10)
            .filter(login => !login.success &&
                new Date() - new Date(login.timestamp) < 24 * 60 * 60 * 1000);

        if (recentFailures.length > 3) {
            recommendations.push({
                type: 'suspicious_activity',
                priority: 'high',
                message: 'Phát hiện nhiều lần đăng nhập thất bại gần đây'
            });
        }
    }

    return recommendations;
};
