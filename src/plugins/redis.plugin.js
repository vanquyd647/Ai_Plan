// src/plugins/redis.plugin.js
const Redis = require('ioredis');
const fp = require('fastify-plugin');
const { redisUrl } = require('../config/redis');

async function redis(fastify, opts) {
    const client = new Redis(redisUrl);
    fastify.decorate('redis', client);
}

module.exports = fp(redis);
