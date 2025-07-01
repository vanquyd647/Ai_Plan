'use strict';
const AuthController = require('./auth.controller');
const AuthSchema = require('./auth.schema');
const { authenticate } = require('../../middleware/auth.middleware');

async function authRoutes(fastify, options) {
    // Rate limiting configurations
    const loginRateLimit = {
        max: 5,
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
        max: 3,
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
        max: 10,
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

    // ✅ Debug route
    fastify.get('/debug/routes', async (req, reply) => {
        return { 
            message: 'Auth routes loaded successfully',
            availableRoutes: [
                'POST /api/auth/login',
                'POST /api/auth/register', 
                'POST /api/auth/refresh-token',
                'POST /api/auth/logout',
                'POST /api/auth/logout-all',
                'GET /api/auth/health',
                'GET /api/auth/google/config',
                'GET /api/auth/google',
                'GET /api/auth/google/callback'
            ]
        };
    });

    // ✅ Đăng ký Google routes
    try {
        await fastify.register(require('./google.routes'), { prefix: '/google' });
        fastify.log.info('Google routes registered successfully');
    } catch (error) {
        fastify.log.error('Error registering Google routes:', error);
        // Không throw error để không crash toàn bộ app
        fastify.log.warn('Continuing without Google authentication');
    }
}

// ✅ QUAN TRỌNG: Export function
module.exports = authRoutes;
