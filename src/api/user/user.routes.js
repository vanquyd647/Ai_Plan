'use strict';
const UserController = require('./user.controller');
const UserSchema = require('./user.schema');

async function userRoutes(fastify, opts) {
    fastify.get('/profile', { schema: UserSchema.getProfile, preHandler: fastify.auth }, UserController.getUserProfile);
    fastify.put('/profile', { schema: UserSchema.updateProfile, preHandler: fastify.auth }, UserController.updateUserProfile);
}

module.exports = (userRoutes);
