'use strict';

const OTPController = require('./otp.controller');
const OTPSchema = require('./otp.schema');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

async function otpRoutes(fastify, options) {
    // Rate limiting configurations
    const generateRateLimit = {
        max: 5,
        timeWindow: '10 minutes',
        keyGenerator: (req) => `otp_generate_${req.ip}_${req.body?.identifier || 'unknown'}`,
        errorResponseBuilder: (req, context) => {
            return {
                success: false,
                message: `Quá nhiều lần tạo OTP. Thử lại sau ${Math.round(context.ttl / 1000)} giây`,
                retryAfter: context.ttl
            };
        }
    };

    const verifyRateLimit = {
        max: 10,
        timeWindow: '5 minutes',
        keyGenerator: (req) => `otp_verify_${req.ip}_${req.body?.identifier || 'unknown'}`,
        errorResponseBuilder: (req, context) => {
            return {
                success: false,
                message: `Quá nhiều lần xác thực OTP. Thử lại sau ${Math.round(context.ttl / 1000)} giây`,
                retryAfter: context.ttl
            };
        }
    };

    const resendRateLimit = {
        max: 3,
        timeWindow: '5 minutes',
        keyGenerator: (req) => `otp_resend_${req.ip}_${req.body?.identifier || 'unknown'}`,
        errorResponseBuilder: (req, context) => {
            return {
                success: false,
                message: `Quá nhiều lần gửi lại OTP. Thử lại sau ${Math.round(context.ttl / 60000)} phút`,
                retryAfter: context.ttl
            };
        }
    };

    const infoRateLimit = {
        max: 20,
        timeWindow: '1 minute',
        keyGenerator: (req) => `otp_info_${req.ip}`,
        errorResponseBuilder: (req, context) => {
            return {
                success: false,
                message: 'Quá nhiều lần truy vấn thông tin OTP',
                retryAfter: context.ttl
            };
        }
    };

    // ✅ Public routes
    fastify.post('/generate', {
        schema: OTPSchema.generate,
        preHandler: fastify.rateLimit(generateRateLimit)
    }, OTPController.generate);

    fastify.post('/verify', {
        schema: OTPSchema.verify,
        preHandler: fastify.rateLimit(verifyRateLimit)
    }, OTPController.verify);

    fastify.post('/resend', {
        schema: OTPSchema.resend,
        preHandler: fastify.rateLimit(resendRateLimit)
    }, OTPController.resend);

    fastify.get('/info/:identifier/:type', {
        schema: OTPSchema.getInfo,
        preHandler: fastify.rateLimit(infoRateLimit)
    }, OTPController.getInfo);

    fastify.get('/types', {
        schema: OTPSchema.getTypes
    }, OTPController.getTypes);

    fastify.get('/health', {
        schema: OTPSchema.health
    }, OTPController.health);

    fastify.get('/rate-limit/:identifier/:type', {
        schema: OTPSchema.checkRateLimit
    }, OTPController.checkRateLimit);

    // ✅ Protected routes (require authentication)
    fastify.post('/cancel', {
        schema: OTPSchema.cancel,
        preHandler: [authenticate]
    }, OTPController.cancel);

    fastify.get('/history', {
        schema: OTPSchema.getHistory,
        preHandler: [authenticate]
    }, OTPController.getHistory);

    // ✅ Admin only routes
    fastify.get('/stats', {
        schema: OTPSchema.getStats,
        preHandler: [authenticate, authorize(['admin'])]
    }, OTPController.getStats);

    fastify.post('/cleanup', {
        schema: OTPSchema.cleanup,
        preHandler: [authenticate, authorize(['admin'])]
    }, OTPController.cleanup);

    fastify.get('/list', {
        schema: OTPSchema.list,
        preHandler: [authenticate, authorize(['admin'])]
    }, OTPController.list);

    fastify.delete('/bulk-delete', {
        schema: OTPSchema.bulkDelete,
        preHandler: [authenticate, authorize(['admin'])]
    }, OTPController.bulkDelete);

    // ✅ Development only routes
    if (process.env.NODE_ENV !== 'production') {
        fastify.post('/test-send', {
            schema: OTPSchema.testSend
        }, OTPController.testSend);

        fastify.get('/debug/:identifier/:type', {
            schema: OTPSchema.debug
        }, OTPController.debug);
    }
}

module.exports = otpRoutes;
