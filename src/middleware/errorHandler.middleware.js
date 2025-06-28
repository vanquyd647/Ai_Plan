// middleware/errorHandler.middleware.js
const errorHandler = (error, request, reply) => {
    // Log error
    request.log.error({
        error: error.message,
        stack: error.stack,
        url: request.url,
        method: request.method,
        ip: request.ip,
        userAgent: request.headers['user-agent']
    });

    // Mongoose validation errors
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return reply.code(400).send({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors
        });
    }

    // Mongoose duplicate key error
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return reply.code(400).send({
            success: false,
            message: `${field} đã tồn tại`
        });
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
        return reply.code(401).send({
            success: false,
            message: 'Token không hợp lệ'
        });
    }

    if (error.name === 'TokenExpiredError') {
        return reply.code(401).send({
            success: false,
            message: 'Token đã hết hạn'
        });
    }

    // Rate limit errors
    if (error.statusCode === 429) {
        return reply.code(429).send({
            success: false,
            message: 'Quá nhiều yêu cầu, vui lòng thử lại sau'
        });
    }

    // Default error
    const statusCode = error.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'Đã xảy ra lỗi' 
        : error.message;

    return reply.code(statusCode).send({
        success: false,
        message,
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    });
};

module.exports = errorHandler;
