// src/middleware/requestLogger.middleware.js
module.exports = async (req, reply) => {
    const start = Date.now();

    reply.addHook('onSend', async (_, res, payload) => {
        const duration = Date.now() - start;
        req.log.info({
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration
        }, 'Request completed');
    });
};
