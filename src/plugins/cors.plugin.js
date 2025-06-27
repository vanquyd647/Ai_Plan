const fp = require('fastify-plugin');
const cors = require('@fastify/cors');

async function corsPlugin(fastify, opts) {
    await fastify.register(cors, { origin: true });
}

module.exports = fp(corsPlugin);