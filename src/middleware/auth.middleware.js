const jwt = require('../utils/jwt');
const User = require('../models/User');

// ✅ Main authentication middleware
const authenticate = async (req, reply) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return reply.code(401).send({
                success: false,
                message: 'Access token không được cung cấp'
            });
        }

        // ✅ Sử dụng jwt utility để extract token
        const token = jwt.extractTokenFromHeader(authHeader);
        
        if (!token) {
            return reply.code(401).send({
                success: false,
                message: 'Format Authorization header không hợp lệ'
            });
        }

        // ✅ Verify access token bằng jwt utility
        const decoded = jwt.verifyAccessToken(token);
        
        // Check if user still exists and is active
        const user = await User.findById(decoded.userId);
        if (!user) {
            return reply.code(401).send({
                success: false,
                message: 'User không tồn tại'
            });
        }

        if (!user.isActive) {
            return reply.code(401).send({
                success: false,
                message: 'Tài khoản đã bị vô hiệu hóa'
            });
        }

        // Check if account is locked
        if (user.isLocked) {
            const lockTime = Math.round((user.lockUntil - Date.now()) / 1000 / 60);
            return reply.code(423).send({
                success: false,
                message: `Tài khoản bị khóa. Thử lại sau ${lockTime} phút`
            });
        }

        // Add user info to request
        req.user = {
            userId: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            isVerified: user.isVerified
        };

        // Add token info to request
        req.token = {
            jti: decoded.jti,
            iat: decoded.iat,
            exp: decoded.exp,
            raw: token
        };

    } catch (error) {
        console.error('Authentication error:', error.message);
        
        // Handle specific JWT errors
        if (error.message.includes('expired')) {
            return reply.code(401).send({
                success: false,
                message: 'Access token đã hết hạn',
                code: 'TOKEN_EXPIRED'
            });
        }
        
        if (error.message.includes('revoked')) {
            return reply.code(401).send({
                success: false,
                message: 'Token đã bị thu hồi',
                code: 'TOKEN_REVOKED'
            });
        }

        return reply.code(401).send({
            success: false,
            message: 'Token không hợp lệ',
            code: 'INVALID_TOKEN'
        });
    }
};

// ✅ Role-based authorization middleware
const authorize = (...allowedRoles) => {
    return async (req, reply) => {
        if (!req.user) {
            return reply.code(401).send({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return reply.code(403).send({
                success: false,
                message: 'Quyền truy cập bị từ chối',
                requiredRoles: allowedRoles,
                userRole: req.user.role
            });
        }
    };
};

// ✅ Optional authentication middleware
const optionalAuth = async (req, reply) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return; // Continue without authentication
        }

        const token = jwt.extractTokenFromHeader(authHeader);
        
        if (!token) {
            return; // Continue without authentication
        }

        // Try to verify token
        const decoded = jwt.verifyAccessToken(token);
        const user = await User.findById(decoded.userId);
        
        if (user && user.isActive && !user.isLocked) {
            req.user = {
                userId: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isVerified: user.isVerified
            };
        }
    } catch (error) {
        // Ignore errors in optional auth
        console.log('Optional auth failed:', error.message);
    }
};

// ✅ Require email verification middleware
const requireEmailVerification = async (req, reply) => {
    if (!req.user) {
        return reply.code(401).send({
            success: false,
            message: 'Authentication required'
        });
    }

    if (!req.user.isVerified) {
        return reply.code(403).send({
            success: false,
            message: 'Email chưa được xác thực',
            code: 'EMAIL_NOT_VERIFIED'
        });
    }
};

// ✅ Admin only middleware
const adminOnly = authorize('admin');

// ✅ User or Admin middleware
const userOrAdmin = authorize('user', 'admin');

module.exports = {
    authenticate,
    authorize,
    optionalAuth,
    requireEmailVerification,
    adminOnly,
    userOrAdmin
};
