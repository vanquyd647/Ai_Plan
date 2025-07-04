// ✅ Login schema
exports.login = {
    body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
            email: { 
                type: 'string', 
                format: 'email',
                maxLength: 255
            },
            password: { 
                type: 'string', 
                minLength: 8,
                maxLength: 128
            },
        },
        additionalProperties: false
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                accessToken: { type: 'string' },
                expiresIn: { type: 'string' },
                // user: {
                //     type: 'object',
                //     properties: {
                //         id: { type: 'string' },
                //         email: { type: 'string' },
                //         name: { type: 'string' },
                //         role: { type: 'string' },
                //         isVerified: { type: 'boolean' },
                //         lastLogin: { type: 'string', format: 'date-time' }
                //     }
                // }
            }
        },
        400: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        },
        401: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        },
        423: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
};

// ✅ Register schema
exports.register = {
    body: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
            email: { 
                type: 'string', 
                format: 'email',
                maxLength: 255
            },
            password: { 
                type: 'string', 
                minLength: 8,
                maxLength: 128
            },
            name: { 
                type: 'string', 
                minLength: 2,
                maxLength: 100
            }
        },
        additionalProperties: false
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                accessToken: { type: 'string' },
                expiresIn: { type: 'string' },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        email: { type: 'string' },
                        name: { type: 'string' },
                        role: { type: 'string' },
                        isVerified: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                }
            }
        },
        400: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        },
        409: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
};

// ✅ Refresh token schema
exports.refreshToken = {
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                accessToken: { type: 'string' },
                expiresIn: { type: 'string' }
            }
        },
        401: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
};

// ✅ Logout schema
exports.logout = {
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
};

// ✅ Logout all schema
exports.logoutAll = {
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
};

module.exports = {
    login: exports.login,
    register: exports.register,
    refreshToken: exports.refreshToken,
    logout: exports.logout,
    logoutAll: exports.logoutAll
};
