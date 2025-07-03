'use strict';

// ✅ Generate OTP schema
exports.generate = {
    body: {
        type: 'object',
        required: ['identifier', 'type'],
        properties: {
            identifier: {
                type: 'string',
                minLength: 3,
                maxLength: 100,
                pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$|^\\+?[1-9]\\d{1,14}$'
            },
            type: {
                type: 'string',
                enum: [
                    'email_verification',
                    'phone_verification',
                    'password_reset',
                    'login_2fa',
                    'transaction',
                    'account_recovery',
                    'change_email',
                    'change_phone',
                    'delete_account',
                    'withdrawal'
                ]
            },
            length: {
                type: 'integer',
                minimum: 4,
                maximum: 8,
                default: 6
            },
            codeType: {
                type: 'string',
                enum: ['numeric', 'alphanumeric', 'alphabetic'],
                default: 'numeric'
            },
            maxAttempts: {
                type: 'integer',
                minimum: 1,
                maximum: 10,
                default: 5
            },
            extra: {
                type: 'object',
                additionalProperties: true
            },
            autoSend: {
                type: 'boolean',
                default: true
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
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        identifier: { type: 'string' },
                        type: { type: 'string' },
                        expiresAt: { type: 'string', format: 'date-time' },
                        timeRemaining: { type: 'integer' },
                        maxAttempts: { type: 'integer' },
                        deliveryMethod: { type: 'string' }
                    }
                }
            }
        },
        400: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                errors: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            field: { type: 'string' },
                            message: { type: 'string' }
                        }
                    }
                }
            }
        },
        429: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                retryAfter: { type: 'integer' }
            }
        }
    }
};

// ✅ Verify OTP schema
exports.verify = {
    body: {
        type: 'object',
        required: ['identifier', 'code', 'type'],
        properties: {
            identifier: {
                type: 'string',
                minLength: 3,
                maxLength: 100
            },
            code: {
                type: 'string',
                minLength: 4,
                maxLength: 8,
                pattern: '^[A-Z0-9]+$'
            },
            type: {
                type: 'string',
                enum: [
                    'email_verification',
                    'phone_verification',
                    'password_reset',
                    'login_2fa',
                    'transaction',
                    'account_recovery',
                    'change_email',
                    'change_phone',
                    'delete_account',
                    'withdrawal'
                ]
            }
        },
        additionalProperties: false
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        identifier: { type: 'string' },
                        type: { type: 'string' },
                        verifiedAt: { type: 'string', format: 'date-time' },
                        userId: { type: 'string' }
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
        429: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                retryAfter: { type: 'integer' }
            }
        }
    }
};

// ✅ Resend OTP schema
exports.resend = {
    body: {
        type: 'object',
        required: ['identifier', 'type'],
        properties: {
            identifier: {
                type: 'string',
                minLength: 3,
                maxLength: 100
            },
            type: {
                type: 'string',
                enum: [
                    'email_verification',
                    'phone_verification',
                    'password_reset',
                    'login_2fa',
                    'transaction',
                    'account_recovery',
                    'change_email',
                    'change_phone',
                    'delete_account',
                    'withdrawal'
                ]
            }
        },
        additionalProperties: false
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        timeRemaining: { type: 'integer' }
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
        429: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                retryAfter: { type: 'integer' }
            }
        }
    }
};

// ✅ Cancel OTP schema
exports.cancel = {
    body: {
        type: 'object',
        required: ['identifier', 'type'],
        properties: {
            identifier: {
                type: 'string',
                minLength: 3,
                maxLength: 100
            },
            type: {
                type: 'string',
                enum: [
                    'email_verification',
                    'phone_verification',
                    'password_reset',
                    'login_2fa',
                    'transaction',
                    'account_recovery',
                    'change_email',
                    'change_phone',
                    'delete_account',
                    'withdrawal'
                ]
            },
            reason: {
                type: 'string',
                maxLength: 200
            }
        },
        additionalProperties: false
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        cancelledAt: { type: 'string', format: 'date-time' }
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
        401: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
};

// ✅ Get OTP info schema
exports.getInfo = {
    params: {
        type: 'object',
        required: ['identifier', 'type'],
        properties: {
            identifier: {
                type: 'string',
                minLength: 3,
                maxLength: 100
            },
            type: {
                type: 'string',
                enum: [
                    'email_verification',
                    'phone_verification',
                    'password_reset',
                    'login_2fa',
                    'transaction',
                    'account_recovery',
                    'change_email',
                    'change_phone',
                    'delete_account',
                    'withdrawal'
                ]
            }
        },
        additionalProperties: false
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        identifier: { type: 'string' },
                        type: { type: 'string' },
                        status: { type: 'string' },
                        attempts: { type: 'integer' },
                        maxAttempts: { type: 'integer' },
                        timeRemaining: { type: 'integer' },
                        isLocked: { type: 'boolean' },
                        canAttempt: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                        expiresAt: { type: 'string', format: 'date-time' }
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
        404: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
};

// ✅ Get OTP types schema
exports.getTypes = {
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        types: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    value: { type: 'string' },
                                    label: { type: 'string' },
                                    duration: { type: 'string' }
                                }
                            }
                        },
                        codeTypes: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    value: { type: 'string' },
                                    label: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

// ✅ Health check schema
exports.health = {
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                timestamp: { type: 'string', format: 'date-time' },
                environment: { type: 'string' },
                version: { type: 'string' }
            }
        }
    }
};

// ✅ Get stats schema (Admin only)
exports.getStats = {
    querystring: {
        type: 'object',
        properties: {
            timeRange: {
                type: 'string',
                enum: ['1h', '24h', '7d', '30d'],
                default: '24h'
            }
        },
        additionalProperties: false
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        timeRange: { type: 'string' },
                        startTime: { type: 'string', format: 'date-time' },
                        endTime: { type: 'string', format: 'date-time' },
                        stats: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    _id: { type: 'string' },
                                    total: { type: 'integer' },
                                    statuses: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                status: { type: 'string' },
                                                count: { type: 'integer' },
                                                avgAttempts: { type: 'number' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        403: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
};

// ✅ Cleanup schema (Admin only)
exports.cleanup = {
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: {
                        deletedCount: { type: 'integer' }
                    }
                }
            }
        },
        403: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
};

// ✅ List OTPs schema (Admin only)
exports.list = {
    querystring: {
        type: 'object',
        properties: {
            page: {
                type: 'integer',
                minimum: 1,
                default: 1
            },
            limit: {
                type: 'integer',
                minimum: 1,
                maximum: 100,
                default: 20
            },
            type: {
                type: 'string',
                enum: [
                    'email_verification',
                    'phone_verification',
                    'password_reset',
                    'login_2fa',
                    'transaction',
                    'account_recovery',
                    'change_email',
                    'change_phone',
                    'delete_account',
                    'withdrawal'
                ]
            },
            status: {
                type: 'string',
                enum: ['pending', 'verified', 'expired', 'failed', 'cancelled']
            },
            identifier: {
                type: 'string',
                maxLength: 100
            }
        },
        additionalProperties: false
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        otps: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    identifier: { type: 'string' },
                                    type: { type: 'string' },
                                    status: { type: 'string' },
                                    attempts: { type: 'integer' },
                                    maxAttempts: { type: 'integer' },
                                    createdAt: { type: 'string', format: 'date-time' },
                                    expiresAt: { type: 'string', format: 'date-time' },
                                    verifiedAt: { type: 'string', format: 'date-time' }
                                }
                            }
                        },
                        pagination: {
                            type: 'object',
                            properties: {
                                page: { type: 'integer' },
                                limit: { type: 'integer' },
                                total: { type: 'integer' },
                                pages: { type: 'integer' }
                            }
                        }
                    }
                }
            }
        },
        403: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
};

// ✅ Bulk delete schema (Admin only)
exports.bulkDelete = {
    body: {
        type: 'object',
        required: ['filters'],
        properties: {
            filters: {
                type: 'object',
                properties: {
                    status: {
                        type: 'array',
                        items: {
                            type: 'string',
                            enum: ['pending', 'verified', 'expired', 'failed', 'cancelled']
                        }
                    },
                    type: {
                        type: 'array',
                        items: {
                            type: 'string',
                            enum: [
                                'email_verification',
                                'phone_verification',
                                'password_reset',
                                'login_2fa',
                                'transaction',
                                'account_recovery',
                                'change_email',
                                'change_phone',
                                'delete_account',
                                'withdrawal'
                            ]
                        }
                    },
                    olderThan: {
                        type: 'string',
                        format: 'date-time'
                    }
                },
                additionalProperties: false
            },
            confirm: {
                type: 'boolean',
                const: true
            }
        },
        additionalProperties: false
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: {
                        deletedCount: { type: 'integer' }
                    }
                }
            }
        },
        403: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
};

// ✅ Test send schema (Development only)
exports.testSend = {
    body: {
        type: 'object',
        required: ['identifier'],
        properties: {
            identifier: {
                type: 'string',
                minLength: 3,
                maxLength: 100
            },
            type: {
                type: 'string',
                enum: [
                    'email_verification',
                    'phone_verification',
                    'password_reset',
                    'login_2fa',
                    'transaction',
                    'account_recovery',
                    'change_email',
                    'change_phone',
                    'delete_account',
                    'withdrawal'
                ],
                default: 'email_verification'
            }
        },
        additionalProperties: false
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        code: { type: 'string' },
                        identifier: { type: 'string' },
                        type: { type: 'string' },
                        expiresAt: { type: 'string', format: 'date-time' }
                    }
                }
            }
        },
        403: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
};

// ✅ Debug schema (Development only)
exports.debug = {
    params: {
        type: 'object',
        required: ['identifier', 'type'],
        properties: {
            identifier: {
                type: 'string',
                minLength: 3,
                maxLength: 100
            },
            type: {
                type: 'string',
                enum: [
                    'email_verification',
                    'phone_verification',
                    'password_reset',
                    'login_2fa',
                    'transaction',
                    'account_recovery',
                    'change_email',
                    'change_phone',
                    'delete_account',
                    'withdrawal'
                ]
            }
        },
        additionalProperties: false
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        otp: {
                            type: 'object',
                            additionalProperties: true
                        },
                        rateLimit: {
                            type: 'object',
                            additionalProperties: true
                        }
                    }
                }
            }
        },
        403: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
};

// ✅ Get history schema
exports.getHistory = {
    querystring: {
        type: 'object',
        properties: {
            page: {
                type: 'integer',
                minimum: 1,
                default: 1
            },
            limit: {
                type: 'integer',
                minimum: 1,
                maximum: 50,
                default: 10
            },
            type: {
                type: 'string',
                enum: [
                    'email_verification',
                    'phone_verification',
                    'password_reset',
                    'login_2fa',
                    'transaction',
                    'account_recovery',
                    'change_email',
                    'change_phone',
                    'delete_account',
                    'withdrawal'
                ]
            },
            status: {
                type: 'string',
                enum: ['pending', 'verified', 'expired', 'failed', 'cancelled']
            }
        },
        additionalProperties: false
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        otps: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    identifier: { type: 'string' },
                                    type: { type: 'string' },
                                    status: { type: 'string' },
                                    attempts: { type: 'integer' },
                                    maxAttempts: { type: 'integer' },
                                    createdAt: { type: 'string', format: 'date-time' },
                                    expiresAt: { type: 'string', format: 'date-time' },
                                    verifiedAt: { type: 'string', format: 'date-time' }
                                }
                            }
                        },
                        pagination: {
                            type: 'object',
                            properties: {
                                page: { type: 'integer' },
                                limit: { type: 'integer' },
                                total: { type: 'integer' },
                                pages: { type: 'integer' }
                            }
                        }
                    }
                }
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

// ✅ Check rate limit schema
exports.checkRateLimit = {
    params: {
        type: 'object',
        required: ['identifier', 'type'],
        properties: {
            identifier: {
                type: 'string',
                minLength: 3,
                maxLength: 100
            },
            type: {
                type: 'string',
                enum: [
                    'email_verification',
                    'phone_verification',
                    'password_reset',
                    'login_2fa',
                    'transaction',
                    'account_recovery',
                    'change_email',
                    'change_phone',
                    'delete_account',
                    'withdrawal'
                ]
            }
        },
        additionalProperties: false
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        generate: {
                            type: 'object',
                            properties: {
                                attempts: { type: 'integer' },
                                maxAttempts: { type: 'integer' },
                                windowMs: { type: 'integer' },
                                canAttempt: { type: 'boolean' }
                            }
                        },
                        verify: {
                            type: 'object',
                            properties: {
                                attempts: { type: 'integer' },
                                maxAttempts: { type: 'integer' },
                                windowMs: { type: 'integer' },
                                canAttempt: { type: 'boolean' }
                            }
                        },
                        resend: {
                            type: 'object',
                            properties: {
                                attempts: { type: 'integer' },
                                maxAttempts: { type: 'integer' },
                                windowMs: { type: 'integer' },
                                canAttempt: { type: 'boolean' }
                            }
                        }
                    }
                }
            }
        }
    }
};