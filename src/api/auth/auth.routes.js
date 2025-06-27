'use strict';
const AuthController = require('./auth.controller');
const AuthSchema = require('./auth.schema');

async function authRoutes(fastify, opts) {
    // Route đăng nhập
    fastify.post('/login', { schema: AuthSchema.login }, AuthController.login);

    // Route đăng ký
    fastify.post('/register', { schema: AuthSchema.register }, AuthController.register);
}

module.exports = (authRoutes);
