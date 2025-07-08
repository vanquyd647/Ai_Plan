// Base response schemas
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

// ✅ Plan object with steps and risks
const planObject = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        category: { type: 'string' },
        status: { type: 'string', enum: ['draft', 'active', 'completed', 'archived'] },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
        tags: {
            type: 'array',
            items: { type: 'string' }
        },
        steps: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    description: { type: 'string' },
                    timeline: { type: 'string' },
                    resources: { type: 'string' }
                }
            }
        },
        risks: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    risk: { type: 'string' },
                    mitigation: { type: 'string' }
                }
            }
        },
        tasks: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    status: { type: 'string' },
                    priority: { type: 'string' },
                    dueDate: { type: 'string', format: 'date-time' }
                }
            }
        },
        userId: { type: 'string' },
        createdBy: { type: 'string' },
        aiMetadata: { type: 'object' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
};

// ✅ Save AI Generated Plan Schema - Updated for steps/risks structure
exports.saveAIGeneratedPlan = {
    description: 'Lưu kế hoạch được tạo bởi AI với cấu trúc steps và risks',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        properties: {
            planData: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    objective: { type: 'string' },
                    steps: {
                        type: 'array',
                        items: {
                            type: 'object',
                            additionalProperties: true
                        }
                    },
                    risks: {
                        type: 'array',
                        items: {
                            type: 'object',
                            additionalProperties: true
                        }
                    }
                },
                additionalProperties: true
            },
            metadata: {
                type: 'object',
                properties: {
                    originalInput: { type: 'string' },
                    generatedAt: { type: 'string' },
                    model: { type: 'string' }
                },
                additionalProperties: true
            },
            status: {
                type: 'string',
                enum: ['draft', 'active', 'completed', 'archived']
            },
            priority: {
                type: 'string',
                enum: ['low', 'medium', 'high']
            }
        },
        additionalProperties: true
    },
    response: {
        201: {
            ...standardResponse,
            properties: {
                ...standardResponse.properties,
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        category: { type: 'string' },
                        status: { type: 'string' },
                        priority: { type: 'string' },
                        stepsCount: { type: 'number' },
                        risksCount: { type: 'number' },
                        createdAt: { type: 'string' }
                    }
                }
            }
        },
        400: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                error: { type: 'string' },
                step: { type: 'object' },
                risk: { type: 'object' }
            }
        },
        500: errorResponse
    }
};

// ✅ Get Plans Schema (with pagination)
exports.getPlans = {
    description: 'Lấy danh sách kế hoạch của người dùng',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            search: { type: 'string', description: 'Tìm kiếm theo tiêu đề hoặc mô tả' },
            category: { type: 'string', description: 'Lọc theo danh mục' },
            sortBy: {
                type: 'string',
                enum: ['createdAt', 'updatedAt', 'title', 'status'],
                default: 'createdAt'
            },
            sortOrder: {
                type: 'string',
                enum: ['asc', 'desc'],
                default: 'desc'
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
                    type: 'array',
                    items: planObject
                },
                pagination: {
                    type: 'object',
                    properties: {
                        currentPage: { type: 'integer' },
                        totalPages: { type: 'integer' },
                        totalItems: { type: 'integer' },
                        itemsPerPage: { type: 'integer' },
                        hasNextPage: { type: 'boolean' },
                        hasPrevPage: { type: 'boolean' }
                    }
                }
            }
        },
        500: errorResponse
    }
};

// ✅ Get Single Plan Schema
exports.getPlan = {
    description: 'Lấy thông tin chi tiết kế hoạch',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'ID của kế hoạch' }
        },
        required: ['id']
    },
    response: {
        200: {
            ...standardResponse,
            properties: {
                ...standardResponse.properties,
                data: planObject
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

// ✅ Create Plan Schema (tiếp tục)
exports.createPlan = {
    description: 'Tạo kế hoạch mới',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        properties: {
            title: {
                type: 'string',
                minLength: 1,
                maxLength: 200,
                description: 'Tiêu đề kế hoạch'
            },
            description: {
                type: 'string',
                minLength: 1,
                description: 'Mô tả kế hoạch'
            },
            category: {
                type: 'string',
                description: 'Danh mục kế hoạch'
            },
            status: {
                type: 'string',
                enum: ['draft', 'active', 'completed', 'archived'],
                default: 'draft',
                description: 'Trạng thái kế hoạch'
            },
            priority: {
                type: 'string',
                enum: ['low', 'medium', 'high'],
                default: 'medium',
                description: 'Độ ưu tiên'
            },
            tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Danh sách thẻ tag'
            },
            tasks: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        title: { type: 'string', minLength: 1 },
                        description: { type: 'string' },
                        status: {
                            type: 'string',
                            enum: ['todo', 'in_progress', 'completed'],
                            default: 'todo'
                        },
                        priority: {
                            type: 'string',
                            enum: ['low', 'medium', 'high'],
                            default: 'medium'
                        },
                        dueDate: { type: 'string', format: 'date-time' },
                        estimatedHours: { type: 'number', minimum: 0 }
                    },
                    required: ['title']
                },
                description: 'Danh sách nhiệm vụ'
            },
            startDate: {
                type: 'string',
                format: 'date-time',
                description: 'Ngày bắt đầu'
            },
            endDate: {
                type: 'string',
                format: 'date-time',
                description: 'Ngày kết thúc'
            },
            budget: {
                type: 'number',
                minimum: 0,
                description: 'Ngân sách dự kiến'
            }
        },
        required: ['title', 'description'],
        additionalProperties: false
    },
    response: {
        201: {
            ...standardResponse,
            properties: {
                ...standardResponse.properties,
                data: planObject
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

// ✅ Save AI Generated Plan Schema 
exports.saveAIGeneratedPlan = {
    description: 'Lưu kế hoạch được tạo bởi AI với cấu trúc steps và risks',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        properties: {
            planData: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    objective: { type: 'string' },
                    steps: {
                        type: 'array',
                        items: {
                            type: 'object',
                            additionalProperties: true
                        }
                    },
                    risks: {
                        type: 'array',
                        items: {
                            type: 'object',
                            additionalProperties: true
                        }
                    }
                },
                additionalProperties: true
            },
            metadata: {
                type: 'object',
                properties: {
                    originalInput: { type: 'string' },
                    generatedAt: { type: 'string' },
                    model: { type: 'string' }
                },
                additionalProperties: true
            },
            status: { 
                type: 'string', 
                enum: ['draft', 'active', 'completed', 'archived']
            },
            priority: { 
                type: 'string', 
                enum: ['low', 'medium', 'high']
            }
        },
        additionalProperties: true
    },
    response: {
        201: {
            ...standardResponse,
            properties: {
                ...standardResponse.properties,
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        category: { type: 'string' },
                        status: { type: 'string' },
                        priority: { type: 'string' },
                        stepsCount: { type: 'number' },
                        risksCount: { type: 'number' },
                        createdAt: { type: 'string' }
                    }
                }
            }
        },
        400: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                error: { type: 'string' },
                step: { type: 'object' },
                risk: { type: 'object' }
            }
        },
        500: errorResponse
    }
};



// ✅ Update Plan Schema
exports.updatePlan = {
    description: 'Cập nhật kế hoạch',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'ID của kế hoạch' }
        },
        required: ['id']
    },
    body: {
        type: 'object',
        properties: {
            title: { type: 'string', minLength: 1, maxLength: 200 },
            description: { type: 'string', minLength: 1 },
            category: { type: 'string' },
            status: {
                type: 'string',
                enum: ['draft', 'active', 'completed', 'archived']
            },
            priority: {
                type: 'string',
                enum: ['low', 'medium', 'high']
            },
            tags: {
                type: 'array',
                items: { type: 'string' }
            },
            tasks: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        title: { type: 'string', minLength: 1 },
                        description: { type: 'string' },
                        status: {
                            type: 'string',
                            enum: ['todo', 'in_progress', 'completed']
                        },
                        priority: {
                            type: 'string',
                            enum: ['low', 'medium', 'high']
                        },
                        dueDate: { type: 'string', format: 'date-time' },
                        estimatedHours: { type: 'number', minimum: 0 }
                    }
                }
            },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            budget: { type: 'number', minimum: 0 }
        },
        additionalProperties: false
    },
    response: {
        200: {
            ...standardResponse,
            properties: {
                ...standardResponse.properties,
                data: planObject
            }
        },
        404: {
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

// ✅ Delete Plan Schema
exports.deletePlan = {
    description: 'Xóa kế hoạch',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'ID của kế hoạch' }
        },
        required: ['id']
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

// ✅ Get Plan Statistics Schema
exports.getPlanStats = {
    description: 'Lấy thống kê kế hoạch của người dùng',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: {
                        totalPlans: { type: 'integer' },
                        completedPlans: { type: 'integer' },
                        activePlans: { type: 'integer' },
                        draftPlans: { type: 'integer' },
                        aiGeneratedPlans: { type: 'integer' },
                        manualPlans: { type: 'integer' },
                        completionRate: { type: 'integer', description: 'Tỷ lệ hoàn thành (%)' }
                    }
                }
            }
        },
        500: errorResponse
    }
};

// ✅ Duplicate Plan Schema
exports.duplicatePlan = {
    description: 'Sao chép kế hoạch',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'ID của kế hoạch cần sao chép' }
        },
        required: ['id']
    },
    body: {
        type: 'object',
        properties: {
            title: {
                type: 'string',
                minLength: 1,
                maxLength: 200,
                description: 'Tiêu đề cho kế hoạch mới (tùy chọn)'
            }
        },
        additionalProperties: false
    },
    response: {
        201: {
            ...standardResponse,
            properties: {
                ...standardResponse.properties,
                data: planObject
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

// ✅ Share Plan Schema
exports.sharePlan = {
    description: 'Chia sẻ kế hoạch',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'ID của kế hoạch cần chia sẻ' }
        },
        required: ['id']
    },
    body: {
        type: 'object',
        properties: {
            shareType: {
                type: 'string',
                enum: ['view', 'edit'],
                default: 'view',
                description: 'Loại quyền chia sẻ'
            },
            expiresIn: {
                type: 'string',
                enum: ['1h', '1d', '7d', '30d'],
                default: '7d',
                description: 'Thời gian hết hạn'
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
                        shareToken: { type: 'string' },
                        shareUrl: { type: 'string', format: 'uri' },
                        shareType: { type: 'string' },
                        expiresAt: { type: 'string', format: 'date-time' }
                    }
                }
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

// ✅ Export Plan Schema
exports.exportPlan = {
    description: 'Xuất kế hoạch ra các định dạng khác nhau',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'ID của kế hoạch cần xuất' }
        },
        required: ['id']
    },
    querystring: {
        type: 'object',
        properties: {
            format: {
                type: 'string',
                enum: ['json', 'csv', 'pdf'],
                default: 'json',
                description: 'Định dạng xuất file'
            }
        }
    },
    response: {
        200: {
            description: 'Dữ liệu xuất thành công (định dạng tùy thuộc vào query parameter)',
            oneOf: [
                {
                    // JSON format
                    type: 'object',
                    properties: planObject.properties
                },
                {
                    // CSV format
                    type: 'string',
                    contentMediaType: 'text/csv'
                },
                {
                    // PDF format
                    type: 'string',
                    contentMediaType: 'application/pdf',
                    contentEncoding: 'binary'
                }
            ]
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
