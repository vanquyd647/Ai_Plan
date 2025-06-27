const fp = require('fastify-plugin');
const websocket = require('@fastify/websocket');

async function websocketPlugin(fastify, opts) {
    fastify.register(websocket);
}

module.exports = fp(websocketPlugin);