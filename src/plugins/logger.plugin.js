const fp = require('fastify-plugin');

async function loggerPlugin(fastify, opts) {
    fastify.addHook('onSend', async (req, reply, payload) => {
        const { method, url } = req;
        const { statusCode } = reply;
        fastify.log.info({ method, url, statusCode }, 'Request completed');
    });
}

module.exports = fp(loggerPlugin);