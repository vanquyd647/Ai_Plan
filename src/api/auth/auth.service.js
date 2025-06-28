const bcrypt = require('bcrypt');
const jwt = require('../../utils/jwt');
const User = require('../../models/User');
const crypto = require('crypto');
const validator = require('validator');

// ✅ Không cần tokenBlacklist ở đây nữa, sử dụng jwt utility

// Password strength validation
const validatePassword = (password) => {
    if (password.length < 8) {
        throw new Error('Mật khẩu phải có ít nhất 8 ký tự');
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?\":{}|<>]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        throw new Error('Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt');
    }
    
    // Check common passwords
    const commonPasswords = [
        'password', '12345678', 'qwerty123', 'admin123', 
        'password123', '123456789', 'welcome123'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
        throw new Error('Mật khẩu quá phổ biến, vui lòng chọn mật khẩu khác');
    }
};

// ✅ Enhanced login with security features
exports.login = async (email, password, clientInfo = {}) => {
    try {
        // Input validation and sanitization
        if (!validator.isEmail(email)) {
            throw new Error('Email không hợp lệ');
        }
        
        const sanitizedEmail = validator.normalizeEmail(email);
        
        // Find user
        const user = await User.findOne({ email: sanitizedEmail });
        
        if (!user) {
            console.log(`Failed login attempt for non-existent email: ${sanitizedEmail} from IP: ${clientInfo.ip}`);
            throw new Error('Email hoặc mật khẩu không chính xác');
        }

        // Check if account is locked
        if (user.isLocked) {
            const lockTime = Math.round((user.lockUntil - Date.now()) / 1000 / 60);
            throw new Error(`Tài khoản bị khóa. Thử lại sau ${lockTime} phút`);
        }

        // Check if account is active
        if (!user.isActive) {
            throw new Error('Tài khoản đã bị vô hiệu hóa');
        }

        // Compare password
        const userWithPassword = await User.findById(user._id).select('+password');
        const isPasswordValid = await userWithPassword.comparePassword(password);
        
        if (!isPasswordValid) {
            await user.incLoginAttempts();
            console.log(`Failed login attempt for ${sanitizedEmail} from IP: ${clientInfo.ip}`);
            throw new Error('Email hoặc mật khẩu không chính xác');
        }

        // Reset login attempts on successful login
        if (user.loginAttempts > 0) {
            await user.resetLoginAttempts();
        }

        // ✅ Generate tokens using jwt utility
        const tokenPair = jwt.generateTokenPair({
            userId: user._id,
            email: user.email,
            role: user.role
        });

        // Add refresh token to user
        const refreshTokenExpiry = new Date();
        refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days

        await user.addRefreshToken(
            tokenPair.refreshToken,
            refreshTokenExpiry,
            clientInfo.userAgent,
            clientInfo.ip
        );

        // Update last login info
        user.lastLogin = new Date();
        user.lastLoginIP = clientInfo.ip;
        await user.save();

        return {
            success: true,
            message: 'Đăng nhập thành công',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isVerified: user.isVerified,
                lastLogin: user.lastLogin
            },
            tokens: {
                accessToken: tokenPair.accessToken,
                refreshToken: tokenPair.refreshToken,
                expiresIn: tokenPair.expiresIn,
                tokenType: tokenPair.tokenType
            }
        };

    } catch (error) {
        console.error('Login error:', error.message, '- IP:', clientInfo.ip);
        throw error;
    }
};

// ✅ Enhanced register function
exports.register = async (userData, clientInfo = {}) => {
    try {
        const { email, password, name } = userData;

        // Validate input
        if (!email || !password || !name) {
            throw new Error('Email, mật khẩu và tên là bắt buộc');
        }

        if (!validator.isEmail(email)) {
            throw new Error('Email không hợp lệ');
        }

        validatePassword(password);

        // Check if user already exists
        const existingUser = await User.findOne({ 
            email: email.toLowerCase().trim() 
        });
        
        if (existingUser) {
            throw new Error('Email đã được sử dụng');
        }

        // Create new user
        const user = new User({
            email: email.toLowerCase().trim(),
            password: password,
            name: name.trim(),
            metadata: {
                registrationIP: clientInfo.ip || 'Unknown',
                registrationUserAgent: clientInfo.userAgent || 'Unknown'
            }
        });

        await user.save();

        // ✅ Generate tokens using jwt utility
        const tokenPair = jwt.generateTokenPair({
            userId: user._id,
            email: user.email,
            role: user.role
        });

        // Add refresh token to user
        const refreshTokenExpiry = new Date();
        refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

        await user.addRefreshToken(
            tokenPair.refreshToken,
            refreshTokenExpiry,
            clientInfo.userAgent,
            clientInfo.ip
        );

        user.lastLogin = new Date();
        user.lastLoginIP = clientInfo.ip;
        await user.save();

        return {
            success: true,
            message: 'Đăng ký thành công',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isVerified: user.isVerified,
                createdAt: user.createdAt
            },
            tokens: {
                accessToken: tokenPair.accessToken,
                refreshToken: tokenPair.refreshToken,
                expiresIn: tokenPair.expiresIn,
                tokenType: tokenPair.tokenType
            }
        };

    } catch (error) {
        console.error('Register error:', error.message, '- IP:', clientInfo.ip);
        
        if (error.code === 11000) {
            throw new Error('Email đã được sử dụng');
        }
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            throw new Error(messages.join(', '));
        }
        
        throw error;
    }
};

// ✅ Refresh token function
exports.refreshToken = async (refreshToken, clientInfo = {}) => {
    try {
        if (!refreshToken) {
            throw new Error('Refresh token là bắt buộc');
        }

        // ✅ Verify refresh token using jwt utility
        const decoded = jwt.verifyRefreshToken(refreshToken);
        
        // Find user and check if refresh token exists
        const user = await User.findById(decoded.userId);
        if (!user) {
            throw new Error('User không tồn tại');
        }

        // Check if refresh token exists in user's tokens
        const tokenRecord = user.findRefreshToken(refreshToken);
        if (!tokenRecord) {
            throw new Error('Refresh token không hợp lệ');
        }

        // ✅ Generate new access token using jwt utility
        const newAccessToken = jwt.generateAccessToken({
            userId: user._id,
            email: user.email,
            role: user.role
        });

        return {
            success: true,
            accessToken: newAccessToken,
            expiresIn: '15m',
            tokenType: 'Bearer'
        };

    } catch (error) {
        console.error('Refresh token error:', error.message);
        throw new Error('Token không hợp lệ hoặc đã hết hạn');
    }
};

// ✅ Logout function
exports.logout = async (refreshToken, userId) => {
    try {
        if (refreshToken) {
            // ✅ Revoke refresh token using jwt utility
            jwt.revokeToken(refreshToken);
            
            // Remove from user's refresh tokens
            const user = await User.findById(userId);
            if (user) {
                await user.removeRefreshToken(refreshToken);
            }
        }

        return {
            success: true,
            message: 'Đăng xuất thành công'
        };
    } catch (error) {
        console.error('Logout error:', error.message);
        throw error;
    }
};

// ✅ Logout from all devices
exports.logoutAll = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User không tồn tại');
        }

        // ✅ Revoke all refresh tokens using jwt utility
        user.refreshTokens.forEach(tokenRecord => {
            jwt.revokeToken(tokenRecord.token);
        });

        // Remove all refresh tokens
        await user.removeAllRefreshTokens();

        return {
            success: true,
            message: 'Đã đăng xuất khỏi tất cả thiết bị'
        };
    } catch (error) {
        console.error('Logout all error:', error.message);
        throw error;
    }
};

// ✅ Check if token is blacklisted (for middleware compatibility)
exports.isTokenBlacklisted = (token) => {
    return jwt.isTokenRevoked(token);
};

// ✅ Get token info
exports.getTokenInfo = (token) => {
    return jwt.getTokenInfo(token);
};

module.exports = {
    login: exports.login,
    register: exports.register,
    refreshToken: exports.refreshToken,
    logout: exports.logout,
    logoutAll: exports.logoutAll,
    isTokenBlacklisted: exports.isTokenBlacklisted,
    getTokenInfo: exports.getTokenInfo,
    validatePassword
};
