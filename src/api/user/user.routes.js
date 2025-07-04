'use strict';
const UserController = require('./user.controller');
const UserSchema = require('./user.schema');
const { authenticate } = require('../../middleware/auth.middleware');

async function userRoutes(fastify, options) {
    // ✅ Áp dụng middleware cho tất cả routes trong group này
    fastify.addHook('preHandler', authenticate);

    // Giờ tất cả routes đều có middleware authenticate
    fastify.get('/profile', {
        schema: UserSchema.getProfile
    }, UserController.getUserProfile);

    fastify.put('/profile', {
        schema: UserSchema.updateProfile
    }, UserController.updateUserProfile);

    // Các route khác...
}

module.exports = userRoutes;
