'use strict';

async function routes(fastify, opts) {
    // Route kiểm tra sức khỏe
    fastify.get('/health', async (req, reply) => {
        req.log.info('Health check OK');
        return { status: 'ok' };
    });

    // Đăng ký route auth với prefix /auth
    fastify.register(require('./auth/auth.routes'), { prefix: '/auth' });

    // Đăng ký route ai với prefix /ai
    fastify.register(require('./ai/ai.routes'), { prefix: '/ai' });

    // Đăng ký route plan với prefix /plans
    fastify.register(require('./plan/plan.routes'), { prefix: '/plans' });

    // Đăng ký route user với prefix /users
    fastify.register(require('./user/user.routes'), { prefix: '/users' });
}

module.exports = routes;
