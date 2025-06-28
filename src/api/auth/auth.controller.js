const AuthService = require('./auth.service');
const validator = require('validator');

// Helper function to get client info
const getClientInfo = (req) => ({
    ip: req.ip || req.connection.remoteAddress || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'] || 'Unknown'
});

// Input sanitization helper
const sanitizeInput = (input) => {
    if (typeof input === 'string') {
        return validator.escape(input.trim());
    }
    return input;
};

// ✅ Login controller
exports.login = async (req, reply) => {
    try {
        const { email, password } = req.body;

        // Enhanced input validation
        if (!email || !password) {
            return reply.code(400).send({
                success: false,
                message: 'Email và mật khẩu là bắt buộc'
            });
        }

        if (!validator.isEmail(email)) {
            return reply.code(400).send({
                success: false,
                message: 'Email không hợp lệ'
            });
        }

        const clientInfo = getClientInfo(req);
        
        // ✅ Call auth service với correct destructuring
        const result = await AuthService.login(email, password, clientInfo);

        // Set refresh token as httpOnly cookie
        reply.setCookie('refreshToken', result.tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/'
        });

        // ✅ Return response without refresh token in body
        return reply.code(200).send({
            success: true,
            message: result.message,
            user: result.user,
            accessToken: result.tokens.accessToken,
            expiresIn: result.tokens.expiresIn
        });

    } catch (error) {
        console.error('Login Controller Error:', error.message);
        
        // Handle specific errors
        if (error.message.includes('khóa')) {
            return reply.code(423).send({
                success: false,
                message: error.message
            });
        }
        
        if (error.message.includes('không chính xác') || error.message.includes('vô hiệu hóa')) {
            return reply.code(401).send({
                success: false,
                message: error.message
            });
        }

        return reply.code(500).send({
            success: false,
            message: 'Lỗi server khi đăng nhập'
        });
    }
};

// ✅ Register controller
exports.register = async (req, reply) => {
    try {
        const { email, password, name } = req.body;

        // Enhanced input validation
        if (!email || !password || !name) {
            return reply.code(400).send({
                success: false,
                message: 'Email, mật khẩu và tên là bắt buộc'
            });
        }

        // Sanitize inputs
        const sanitizedData = {
            email: sanitizeInput(email),
            password: password, // Don't sanitize password
            name: sanitizeInput(name)
        };

        // Get client info
        const clientInfo = getClientInfo(req);

        // Call auth service
        const result = await AuthService.register(sanitizedData, clientInfo);

        // Set refresh token as httpOnly cookie
        reply.setCookie('refreshToken', result.tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/'
        });

        // Return success response (without refresh token in body)
        return reply.code(201).send({
            success: true,
            message: result.message,
            user: result.user,
            accessToken: result.tokens.accessToken,
            expiresIn: result.tokens.expiresIn
        });

    } catch (error) {
        console.error('Register Controller Error:', error.message);
        
        // Handle specific errors
        if (error.message.includes('Email đã được sử dụng')) {
            return reply.code(409).send({
                success: false,
                message: 'Email đã được sử dụng'
            });
        }
        
        if (error.message.includes('Mật khẩu')) {
            return reply.code(400).send({
                success: false,
                message: error.message
            });
        }

        return reply.code(500).send({
            success: false,
            message: 'Lỗi server khi đăng ký'
        });
    }
};

// ✅ Refresh token controller
exports.refreshToken = async (req, reply) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        
        if (!refreshToken) {
            return reply.code(401).send({
                success: false,
                message: 'Refresh token không tồn tại'
            });
        }

        const clientInfo = getClientInfo(req);
        const result = await AuthService.refreshToken(refreshToken, clientInfo);

        return reply.code(200).send(result);

    } catch (error) {
        console.error('Refresh Token Controller Error:', error.message);
        
        // Clear invalid refresh token cookie
        reply.clearCookie('refreshToken');
        
        return reply.code(401).send({
            success: false,
            message: 'Token không hợp lệ hoặc đã hết hạn'
        });
    }
};

// ✅ Logout controller
exports.logout = async (req, reply) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        const userId = req.user?.userId;

        await AuthService.logout(refreshToken, userId);

        // Clear refresh token cookie
        reply.clearCookie('refreshToken');

        return reply.code(200).send({
            success: true,
            message: 'Đăng xuất thành công'
        });

    } catch (error) {
        console.error('Logout Controller Error:', error.message);
        
        return reply.code(500).send({
            success: false,
            message: 'Lỗi server khi đăng xuất'
        });
    }
};

// ✅ Logout from all devices controller
exports.logoutAll = async (req, reply) => {
    try {
        const userId = req.user.userId;
        
        const result = await AuthService.logoutAll(userId);

        // Clear refresh token cookie
        reply.clearCookie('refreshToken');

        return reply.code(200).send(result);

    } catch (error) {
        console.error('Logout All Controller Error:', error.message);
        
        return reply.code(500).send({
            success: false,
            message: 'Lỗi server khi đăng xuất'
        });
    }
};

module.exports = {
    login: exports.login,
    register: exports.register,
    refreshToken: exports.refreshToken,
    logout: exports.logout,
    logoutAll: exports.logoutAll
};
