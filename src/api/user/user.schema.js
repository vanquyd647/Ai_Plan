// Response schemas
const userProfileResponse = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        email: { type: 'string', format: 'email' },
        name: { type: 'string' },
        role: { type: 'string', enum: ['user', 'admin', 'moderator'] },
        avatar: { type: 'string' },
        isActive: { type: 'boolean' },
        isVerified: { type: 'boolean' },
        authProvider: { type: 'string', enum: ['local', 'google', 'facebook', 'github'] },
        googleId: { type: ['string', 'null'] },
        oauthData: { type: 'object' },
        lastLogin: { type: 'string', format: 'date-time' },
        lastLoginIP: { type: 'string' },
        recentLogins: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    timestamp: { type: 'string', format: 'date-time' },
                    authProvider: { type: 'string' },
                    success: { type: 'boolean' },
                    ip: { type: 'string' },
                    userAgent: { type: 'string' },
                    location: { type: 'string' }
                }
            }
        },
        stats: {
            type: 'object',
            properties: {
                totalLogins: { type: 'number' },
                successfulLogins: { type: 'number' },
                failedLogins: { type: 'number' },
                activeRefreshTokens: { type: 'number' },
                accountAge: { type: 'number' }
            }
        },
        preferences: { type: 'object' },
        notifications: { type: 'object' },
        privacy: { type: 'object' },
        twoFactorAuth: {
            type: 'object',
            properties: {
                enabled: { type: 'boolean' },
                method: { type: ['string', 'null'] },
                hasBackupCodes: { type: 'boolean' }
            }
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        metadata: {
            type: 'object',
            properties: {
                profileCompleteness: { type: 'number' },
                securityScore: { type: 'number' },
                lastActivity: { type: 'string', format: 'date-time' }
            }
        }
    }
};

const standardResponse = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'object' }
    }
};

const errorResponse = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        error: { type: 'string' }
    }
};

// ✅ Get Profile Schema
exports.getProfile = {
    description: 'Lấy thông tin chi tiết người dùng',
    tags: ['User'],
    security: [{ bearerAuth: [] }],
    response: {
        200: {
            ...standardResponse,
            properties: {
                ...standardResponse.properties,
                data: userProfileResponse
            }
        },
        500: errorResponse
    }
};

// ✅ Get Settings Schema
exports.getSettings = {
    description: 'Lấy cài đặt người dùng',
    tags: ['User'],
    security: [{ bearerAuth: [] }],
    response: {
        200: {
            ...standardResponse,
            properties: {
                ...standardResponse.properties,
                data: {
                    type: 'object',
                    properties: {
                        preferences: {
                            type: 'object',
                            properties: {
                                language: { type: 'string' },
                                theme: { type: 'string' },
                                timezone: { type: 'string' },
                                dateFormat: { type: 'string' },
                                timeFormat: { type: 'string' },
                                emailNotifications: { type: 'boolean' },
                                pushNotifications: { type: 'boolean' },
                                smsNotifications: { type: 'boolean' },
                                marketingEmails: { type: 'boolean' }
                            }
                        },
                        notifications: {
                            type: 'object',
                            properties: {
                                email: { type: 'boolean' },
                                push: { type: 'boolean' },
                                sms: { type: 'boolean' },
                                marketing: { type: 'boolean' },
                                security: { type: 'boolean' },
                                updates: { type: 'boolean' }
                            }
                        },
                        privacy: {
                            type: 'object',
                            properties: {
                                profileVisibility: { type: 'string' },
                                showEmail: { type: 'boolean' },
                                showLastLogin: { type: 'boolean' },
                                showOnlineStatus: { type: 'boolean' },
                                allowSearchEngines: { type: 'boolean' },
                                allowDataCollection: { type: 'boolean' }
                            }
                        },
                        twoFactorAuth: {
                            type: 'object',
                            properties: {
                                enabled: { type: 'boolean' },
                                method: { type: ['string', 'null'] }
                            }
                        }
                    }
                }
            }
        },
        500: errorResponse
    }
};

// ✅ Get Security Schema
exports.getSecurity = {
    description: 'Lấy thông tin bảo mật người dùng',
    tags: ['User'],
    security: [{ bearerAuth: [] }],
    response: {
        200: {
            ...standardResponse,
            properties: {
                ...standardResponse.properties,
                data: {
                    type: 'object',
                    properties: {
                        securityStatus: {
                            type: 'object',
                            properties: {
                                isVerified: { type: 'boolean' },
                                twoFactorEnabled: { type: 'boolean' },
                                authProvider: { type: 'string' },
                                securityScore: { type: 'number' }
                            }
                        },
                        lastLogin: { type: 'string', format: 'date-time' },
                        lastLoginIP: { type: 'string' },
                        activeSessions: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    createdAt: { type: 'string', format: 'date-time' },
                                    expiresAt: { type: 'string', format: 'date-time' },
                                    userAgent: { type: 'string' },
                                    ip: { type: 'string' },
                                    authProvider: { type: 'string' },
                                    isCurrentSession: { type: 'boolean' }
                                }
                            }
                        },
                        loginHistory: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    timestamp: { type: 'string', format: 'date-time' },
                                    authProvider: { type: 'string' },
                                    success: { type: 'boolean' },
                                    failureReason: { type: 'string' },
                                    ip: { type: 'string' },
                                    userAgent: { type: 'string' },
                                    location: { type: 'string' }
                                }
                            }
                        },
                        recommendations: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    type: { type: 'string' },
                                    priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                                    message: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            }
        },
        500: errorResponse
    }
};

// ✅ Update Profile Schema
exports.updateProfile = {
    description: 'Cập nhật thông tin người dùng',
    tags: ['User'],
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                minLength: 2,
                maxLength: 100,
                description: 'Tên người dùng'
            },
            avatar: {
                type: 'string',
                format: 'uri',
                description: 'URL avatar'
            },
            preferences: {
                type: 'object',
                properties: {
                    language: {
                        type: 'string',
                        enum: ['vi', 'en'],
                        description: 'Ngôn ngữ hiển thị'
                    },
                    theme: {
                        type: 'string',
                        enum: ['light', 'dark', 'auto'],
                        description: 'Chủ đề giao diện'
                    },
                    timezone: {
                        type: 'string',
                        description: 'Múi giờ'
                    },
                    emailNotifications: {
                        type: 'boolean',
                        description: 'Nhận thông báo qua email'
                    },
                    pushNotifications: {
                        type: 'boolean',
                        description: 'Nhận thông báo đẩy'
                    }
                },
                additionalProperties: false
            },
            notifications: {
                type: 'object',
                properties: {
                    email: { type: 'boolean' },
                    push: { type: 'boolean' },
                    sms: { type: 'boolean' },
                    marketing: { type: 'boolean' }
                },
                additionalProperties: false
            },
            privacy: {
                type: 'object',
                properties: {
                    profileVisibility: {
                        type: 'string',
                        enum: ['public', 'private', 'friends']
                    },
                    showEmail: { type: 'boolean' },
                    showLastLogin: { type: 'boolean' },
                    allowSearchEngines: { type: 'boolean' }
                },
                additionalProperties: false
            }
        },
        additionalProperties: false
    },
    response: {
        200: {
            ...standardResponse,
            properties: {
                ...standardResponse.properties,
                data: userProfileResponse
            }
        },
        400: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                errors: {
                    type: 'array',
                    items: { type: 'string' }
                }
            }
        },
        500: errorResponse
    }
};

// ✅ Update Settings Schema
exports.updateSettings = {
    description: 'Cập nhật cài đặt người dùng',
    tags: ['User'],
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        properties: {
            preferences: {
                type: 'object',
                properties: {
                    language: { type: 'string', enum: ['vi', 'en'] },
                    theme: { type: 'string', enum: ['light', 'dark', 'auto'] },
                    timezone: { type: 'string' },
                    dateFormat: { type: 'string', enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
                    timeFormat: { type: 'string', enum: ['12h', '24h'] },
                    emailNotifications: { type: 'boolean' },
                    pushNotifications: { type: 'boolean' },
                    smsNotifications: { type: 'boolean' },
                    marketingEmails: { type: 'boolean' }
                },
                additionalProperties: false
            },
            notifications: {
                type: 'object',
                properties: {
                    email: { type: 'boolean' },
                    push: { type: 'boolean' },
                    sms: { type: 'boolean' },
                    marketing: { type: 'boolean' },
                    security: { type: 'boolean' },
                    updates: { type: 'boolean' }
                },
                additionalProperties: false
            },
            privacy: {
                type: 'object',
                properties: {
                    profileVisibility: {
                        type: 'string',
                        enum: ['public', 'private', 'friends']
                    },
                    showEmail: { type: 'boolean' },
                    showLastLogin: { type: 'boolean' },
                    showOnlineStatus: { type: 'boolean' },
                    allowSearchEngines: { type: 'boolean' },
                    allowDataCollection: { type: 'boolean' }
                },
                additionalProperties: false
            }
        },
        additionalProperties: false
    },
    response: {
        200: standardResponse,
        500: errorResponse
    }
};

// ✅ Revoke Token Schema
exports.revokeToken = {
    description: 'Đăng xuất khỏi thiết bị cụ thể',
    tags: ['User'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            tokenId: {
                type: 'string',
                description: 'ID của refresh token cần thu hồi'
            }
        },
        required: ['tokenId']
    },
    response: {
        200: {
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
        },
        500: errorResponse
    }
};

// ✅ Revoke All Tokens Schema
exports.revokeAllTokens = {
    description: 'Đăng xuất khỏi tất cả thiết bị',
    tags: ['User'],
    security: [{ bearerAuth: [] }],
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        },
        500: errorResponse
    }
};

// ✅ Delete Account Schema
exports.deleteAccount = {
    description: 'Xóa tài khoản người dùng',
    tags: ['User'],
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        properties: {
            password: {
                type: 'string',
                minLength: 6,
                description: 'Mật khẩu xác nhận (chỉ cần cho tài khoản local)'
            },
            confirmText: {
                type: 'string',
                enum: ['DELETE'],
                description: 'Nhập "DELETE" để xác nhận'
            }
        },
        anyOf: [
            { required: ['password'] },
            { required: ['confirmText'] }
        ]
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
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
        },
        500: errorResponse
    }
};

// ✅ Additional schemas for future endpoints

// Change Password Schema
exports.changePassword = {
    description: 'Đổi mật khẩu người dùng',
    tags: ['User'],
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        properties: {
            currentPassword: {
                type: 'string',
                minLength: 6,
                description: 'Mật khẩu hiện tại'
            },
            newPassword: {
                type: 'string',
                minLength: 6,
                pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{6,}$',
                description: 'Mật khẩu mới (ít nhất 6 ký tự, có chữ hoa, chữ thường và số)'
            },
            confirmPassword: {
                type: 'string',
                description: 'Xác nhận mật khẩu mới'
            }
        },
        required: ['currentPassword', 'newPassword', 'confirmPassword']
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        },
        400: errorResponse,
        500: errorResponse
    }
};

// Upload Avatar Schema
exports.uploadAvatar = {
    description: 'Upload avatar người dùng',
    tags: ['User'],
    security: [{ bearerAuth: [] }],
    consumes: ['multipart/form-data'],
    body: {
        type: 'object',
        properties: {
            avatar: {
                type: 'string',
                format: 'binary',
                description: 'File ảnh avatar (jpg, png, gif, tối đa 5MB)'
            }
        },
        required: ['avatar']
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
                        avatarUrl: { type: 'string', format: 'uri' }
                    }
                }
            }
        },
        400: errorResponse,
        413: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        },
        500: errorResponse
    }
};

// Export Activity Schema
exports.exportData = {
    description: 'Xuất dữ liệu người dùng',
    tags: ['User'],
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            format: {
                type: 'string',
                enum: ['json', 'csv'],
                default: 'json',
                description: 'Định dạng xuất dữ liệu'
            },
            includeHistory: {
                type: 'boolean',
                default: false,
                description: 'Bao gồm lịch sử đăng nhập'
            }
        }
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
                        downloadUrl: { type: 'string', format: 'uri' },
                        expiresAt: { type: 'string', format: 'date-time' }
                    }
                }
            }
        },
        500: errorResponse
    }
};

// Verify Email Schema
exports.verifyEmail = {
    description: 'Gửi lại email xác minh',
    tags: ['User'],
    security: [{ bearerAuth: [] }],
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        },
        400: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        },
        500: errorResponse
    }
};

