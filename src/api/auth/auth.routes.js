'use strict';
const AuthController = require('./auth.controller');
const AuthSchema = require('./auth.schema');
const { authenticate } = require('../../middleware/auth.middleware');

async function authRoutes(fastify, options) {
    // Rate limiting configurations
    const loginRateLimit = {
        max: 5, // 5 attempts
        timeWindow: '15 minutes',
        keyGenerator: (req) => `login_${req.ip}_${req.body?.email || 'unknown'}`,
        errorResponseBuilder: (req, context) => {
            return {
                success: false,
                message: `Quá nhiều lần thử đăng nhập. Thử lại sau ${Math.round(context.ttl / 1000)} giây`,
                retryAfter: context.ttl
            };
        }
    };

    const registerRateLimit = {
        max: 3, // 3 registrations
        timeWindow: '1 hour',
        keyGenerator: (req) => `register_${req.ip}`,
        errorResponseBuilder: (req, context) => {
            return {
                success: false,
                message: `Quá nhiều lần đăng ký. Thử lại sau ${Math.round(context.ttl / 60000)} phút`,
                retryAfter: context.ttl
            };
        }
    };

    const refreshRateLimit = {
        max: 10, // 10 refresh attempts
        timeWindow: '15 minutes',
        keyGenerator: (req) => `refresh_${req.ip}`,
        errorResponseBuilder: (req, context) => {
            return {
                success: false,
                message: 'Quá nhiều lần làm mới token',
                retryAfter: context.ttl
            };
        }
    };

    // ✅ Public routes
    fastify.post('/login', {
        schema: AuthSchema.login,
        preHandler: fastify.rateLimit(loginRateLimit)
    }, AuthController.login);

    fastify.post('/register', {
        schema: AuthSchema.register,
        preHandler: fastify.rateLimit(registerRateLimit)
    }, AuthController.register);

    fastify.post('/refresh-token', {
        schema: AuthSchema.refreshToken,
        preHandler: fastify.rateLimit(refreshRateLimit)
    }, AuthController.refreshToken);

    // ✅ Protected routes
    fastify.post('/logout', {
        schema: AuthSchema.logout,
        preHandler: [authenticate]
    }, AuthController.logout);

    fastify.post('/logout-all', {
        schema: AuthSchema.logoutAll,
        preHandler: [authenticate]
    }, AuthController.logoutAll);

    // ✅ Health check route
    fastify.get('/health', async (request, reply) => {
        return {
            success: true,
            message: 'Auth service is healthy',
            timestamp: new Date().toISOString()
        };
    });
}

module.exports = authRoutes;
