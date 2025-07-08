'use strict';
const UserController = require('./user.controller');
const UserSchema = require('./user.schema');
const { authenticate } = require('../../middleware/auth.middleware');

async function userRoutes(fastify, options) {
    // ✅ Áp dụng middleware cho tất cả routes
    fastify.addHook('preHandler', authenticate);

    // ✅ Get user profile (enhanced)
    fastify.get('/profile', {
        schema: UserSchema.getProfile,
        handler: UserController.getUserProfile
    });

    // ✅ NEW: Get user settings
    fastify.get('/settings', {
        schema: UserSchema.getSettings,
        handler: UserController.getUserSettings
    });

    // ✅ NEW: Get user security info
    fastify.get('/security', {
        schema: UserSchema.getSecurity,
        handler: UserController.getUserSecurity
    });

    // ✅ NEW: Update user profile
    fastify.put('/profile', {
        schema: UserSchema.updateProfile,
        handler: UserController.updateUserProfile
    });

    // ✅ NEW: Update user settings
    fastify.put('/settings', {
        schema: UserSchema.updateSettings,
        handler: UserController.updateUserSettings
    });

    // ✅ NEW: Revoke specific refresh token (logout from device)
    fastify.delete('/sessions/:tokenId', {
        schema: UserSchema.revokeToken,
        handler: UserController.revokeRefreshToken
    });

    // ✅ NEW: Revoke all refresh tokens (logout from all devices)
    fastify.delete('/sessions', {
        schema: UserSchema.revokeAllTokens,
        handler: UserController.revokeAllRefreshTokens
    });

    // ✅ NEW: Delete user account
    fastify.delete('/account', {
        schema: UserSchema.deleteAccount,
        handler: UserController.deleteUserAccount
    });
}

module.exports = userRoutes;
