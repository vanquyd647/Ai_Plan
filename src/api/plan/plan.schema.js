// schemas/plan/plan.schema.js - COMPLETE UPDATED VERSION

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

// ✅ Enhanced Task Object with Assignment Support
const taskObject = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        status: {
            type: 'string',
            enum: ['todo', 'in-progress', 'review', 'completed']
        },
        priority: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'urgent']
        },
        dueDate: { type: 'string', format: 'date-time' },
        estimatedTime: { type: 'number' },
        actualTime: { type: 'number' },
        tags: {
            type: 'array',
            items: { type: 'string' }
        },

        // ✅ Assignment fields
        assignedTo: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    userId: { type: 'string' },
                    user: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            email: { type: 'string' },
                            avatar: { type: ['string', 'null'] }
                        }
                    },
                    role: {
                        type: 'string',
                        enum: ['owner', 'collaborator', 'reviewer']
                    },
                    assignedAt: { type: 'string', format: 'date-time' },
                    assignedBy: { type: 'string' }
                }
            }
        },

        // ✅ Comments
        comments: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    content: { type: 'string' },
                    author: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            email: { type: 'string' },
                            avatar: { type: ['string', 'null'] }
                        }
                    },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                    isEdited: { type: 'boolean' }
                }
            }
        },

        // ✅ Attachments
        attachments: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    fileName: { type: 'string' },
                    fileUrl: { type: 'string' },
                    fileSize: { type: 'number' },
                    fileType: { type: 'string' },
                    uploadedBy: { type: 'string' },
                    uploadedAt: { type: 'string', format: 'date-time' }
                }
            }
        },

        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
};

// ✅ Comment Object
const commentObject = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        content: { type: 'string' },
        author: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
                avatar: { type: ['string', 'null'] }
            }
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        isEdited: { type: 'boolean' }
    }
};

// ✅ Enhanced Plan Object with AI Support
const planObject = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },

        // ✅ Plan source
        source: {
            type: 'string',
            enum: ['manual', 'ai-generated']
        },

        // ✅ AI-specific fields
        aiPrompt: { type: ['string', 'null'] },
        aiModel: { type: ['string', 'null'] },
        aiGeneratedAt: { type: ['string', 'null'], format: 'date-time' },

        category: {
            type: 'string',
            enum: ['personal', 'work', 'education', 'health', 'finance', 'travel', 'other']
        },
        priority: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'urgent']
        },
        status: {
            type: 'string',
            enum: ['draft', 'active', 'completed', 'archived']
        },
        startDate: { type: ['string', 'null'], format: 'date-time' },
        endDate: { type: ['string', 'null'], format: 'date-time' },

        // User info
        userId: { type: 'string' },
        createdBy: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
                avatar: { type: ['string', 'null'] }
            }
        },

        // Tasks
        tasks: {
            type: 'array',
            items: taskObject
        },

        // Collaborators
        collaborators: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    userId: { type: 'string' },
                    user: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            email: { type: 'string' },
                            avatar: { type: ['string', 'null'] }
                        }
                    },
                    role: {
                        type: 'string',
                        enum: ['owner', 'editor', 'viewer']
                    },
                    permissions: {
                        type: 'array',
                        items: {
                            type: 'string',
                            enum: ['view', 'edit', 'delete', 'share', 'manage_tasks', 'manage_collaborators']
                        }
                    },
                    addedAt: { type: 'string', format: 'date-time' },
                    addedBy: { type: 'string' }
                }
            }
        },

        // Settings
        isPublic: { type: 'boolean' },
        allowComments: { type: 'boolean' },
        allowCollaboration: { type: 'boolean' },

        // Tags
        tags: {
            type: 'array',
            items: { type: 'string' }
        },

        // Sharing
        shareSettings: {
            type: 'object',
            properties: {
                isShared: { type: 'boolean' },
                shareToken: { type: ['string', 'null'] },
                shareType: {
                    type: 'string',
                    enum: ['view', 'edit']
                },
                expiresAt: { type: ['string', 'null'], format: 'date-time' }
            }
        },

        // Progress
        progress: {
            type: 'object',
            properties: {
                totalTasks: { type: 'number' },
                completedTasks: { type: 'number' },
                percentage: { type: 'number' }
            }
        },

        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
};

// ✅ Pagination Object
const paginationObject = {
    type: 'object',
    properties: {
        currentPage: { type: 'number' },
        totalPages: { type: 'number' },
        totalItems: { type: 'number' },
        itemsPerPage: { type: 'number' },
        hasNext: { type: 'boolean' },
        hasPrev: { type: 'boolean' }
    }
};

// ✅ UNIFIED: Create Plan Schema (supports both manual and AI)
const createPlan = {
    description: 'Tạo kế hoạch mới (manual hoặc AI-generated)',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        required: ['title'],
        properties: {
            title: {
                type: 'string',
                minLength: 1,
                maxLength: 200,
                description: 'Tiêu đề kế hoạch'
            },
            description: {
                type: 'string',
                maxLength: 1000,
                description: 'Mô tả kế hoạch'
            },

            // ✅ Source identification
            source: {
                type: 'string',
                enum: ['manual', 'ai-generated'],
                default: 'manual',
                description: 'Nguồn tạo kế hoạch'
            },

            // ✅ Basic plan info
            category: {
                type: 'string',
                enum: ['personal', 'work', 'education', 'health', 'finance', 'travel', 'other'],
                default: 'personal'
            },
            priority: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'urgent'],
                default: 'medium'
            },
            status: {
                type: 'string',
                enum: ['draft', 'active', 'completed', 'archived'],
                default: 'draft'
            },

            // ✅ Dates
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

            // ✅ Tasks array (for AI-generated plans)
            tasks: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['title'],
                    properties: {
                        id: { type: 'string' },
                        title: { type: 'string', minLength: 1, maxLength: 200 },
                        description: { type: 'string', maxLength: 1000 },
                        status: {
                            type: 'string',
                            enum: ['todo', 'in-progress', 'review', 'completed'],
                            default: 'todo'
                        },
                        priority: {
                            type: 'string',
                            enum: ['low', 'medium', 'high', 'urgent'],
                            default: 'medium'
                        },
                        dueDate: { type: 'string', format: 'date-time' },
                        estimatedTime: { type: 'number', minimum: 0 },
                        tags: {
                            type: 'array',
                            items: { type: 'string' }
                        }
                    }
                },
                default: []
            },

            // ✅ Collaborators
            collaborators: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        userId: { type: 'string' },
                        role: {
                            type: 'string',
                            enum: ['owner', 'editor', 'viewer'],
                            default: 'viewer'
                        },
                        permissions: {
                            type: 'array',
                            items: {
                                type: 'string',
                                enum: ['view', 'edit', 'delete', 'share', 'manage_tasks', 'manage_collaborators']
                            }
                        }
                    }
                },
                default: []
            },

            // ✅ Additional fields
            tags: {
                type: 'array',
                items: { type: 'string' },
                default: []
            },
            isPublic: {
                type: 'boolean',
                default: false
            },
            allowComments: {
                type: 'boolean',
                default: true
            },
            allowCollaboration: {
                type: 'boolean',
                default: true
            },

            // ✅ AI-specific fields
            aiPrompt: {
                type: 'string',
                description: 'Prompt gốc được sử dụng để tạo plan (chỉ cho AI-generated)'
            },
            aiModel: {
                type: 'string',
                description: 'Model AI được sử dụng (chỉ cho AI-generated)'
            },
            aiGeneratedAt: {
                type: 'string',
                format: 'date-time',
                description: 'Thời gian tạo bởi AI (chỉ cho AI-generated)'
            }
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: planObject
            }
        },
        400: errorResponse,
        500: errorResponse
    }
};

// ✅ Get Plans Schema
const getPlans = {
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
                default: 10 
            },
            search: { 
                type: 'string',
                default: ''
            },
            // ✅ FIX: Allow empty string for category
            category: { 
                type: 'string',
                enum: ['', 'personal', 'work', 'education', 'health', 'finance', 'travel', 'other'],
                default: ''
            },
            // ✅ FIX: Allow empty string for status
            status: { 
                type: 'string',
                enum: ['', 'draft', 'active', 'completed', 'archived', 'paused'],
                default: ''
            },
            // ✅ FIX: Allow empty string for priority
            priority: { 
                type: 'string',
                enum: ['', 'low', 'medium', 'high', 'urgent'],
                default: ''
            },
            // ✅ FIX: Allow empty string for source
            source: { 
                type: 'string',
                enum: ['', 'manual', 'ai-generated'],
                default: ''
            },
            sortBy: { 
                type: 'string',
                enum: ['title', 'createdAt', 'updatedAt', 'priority', 'status'],
                default: 'updatedAt'
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
                        hasNext: { type: 'boolean' },
                        hasPrev: { type: 'boolean' }
                    }
                }
            }
        },
        400: errorResponse,
        401: errorResponse,
        500: errorResponse
    }
};

// ✅ Get Plan Schema
const getPlan = {
    description: 'Lấy thông tin chi tiết một kế hoạch',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', description: 'ID của kế hoạch' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: planObject
            }
        },
        404: errorResponse,
        500: errorResponse
    }
};

// ✅ Update Plan Schema
const updatePlan = {
    description: 'Cập nhật thông tin kế hoạch',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', description: 'ID của kế hoạch' }
        }
    },
    body: {
        type: 'object',
        properties: {
            title: { type: 'string', minLength: 1, maxLength: 200 },
            description: { type: 'string', maxLength: 1000 },
            category: {
                type: 'string',
                enum: ['personal', 'work', 'education', 'health', 'finance', 'travel', 'other']
            },
            priority: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'urgent']
            },
            status: {
                type: 'string',
                enum: ['draft', 'active', 'completed', 'archived']
            },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            tags: {
                type: 'array',
                items: { type: 'string' }
            },
            isPublic: { type: 'boolean' },
            allowComments: { type: 'boolean' },
            allowCollaboration: { type: 'boolean' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: planObject
            }
        },
        404: errorResponse,
        500: errorResponse
    }
};

// ✅ Delete Plan Schema
const deletePlan = {
    description: 'Xóa kế hoạch',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', description: 'ID của kế hoạch' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        },
        404: errorResponse,
        500: errorResponse
    }
};

// ✅ Get Plan Stats Schema
const getPlanStats = {
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
                        totalPlans: { type: 'number' },
                        draftPlans: { type: 'number' },
                        activePlans: { type: 'number' },
                        completedPlans: { type: 'number' },
                        archivedPlans: { type: 'number' },
                        totalTasks: { type: 'number' },
                        completedTasks: { type: 'number' },
                        manualPlans: { type: 'number' },
                        aiGeneratedPlans: { type: 'number' },
                        completionPercentage: { type: 'number' }
                    }
                }
            }
        },
        500: errorResponse
    }
};

// ✅ Duplicate Plan Schema
const duplicatePlan = {
    description: 'Sao chép kế hoạch',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', description: 'ID của kế hoạch cần sao chép' }
        }
    },
    body: {
        type: 'object',
        properties: {
            title: {
                type: 'string',
                minLength: 1,
                maxLength: 200,
                description: 'Tiêu đề mới cho kế hoạch sao chép'
            }
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: planObject
            }
        },
        404: errorResponse,
        500: errorResponse
    }
};

// ✅ Share Plan Schema
const sharePlan = {
    description: 'Tạo link chia sẻ kế hoạch',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', description: 'ID của kế hoạch' }
        }
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
                type: 'number',
                description: 'Thời gian hết hạn (milliseconds)'
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
                        shareLink: { type: 'string' }
                    }
                }
            }
        },
        404: errorResponse,
        500: errorResponse
    }
};

// ✅ Export Plan Schema
const exportPlan = {
    description: 'Xuất kế hoạch ra file',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', description: 'ID của kế hoạch' }
        }
    },
    querystring: {
        type: 'object',
        properties: {
            format: {
                type: 'string',
                enum: ['json', 'csv', 'pdf', 'xlsx'],
                default: 'json',
                description: 'Định dạng file xuất'
            }
        }
    },
    response: {
        200: {
            description: 'File được xuất thành công'
        },
        404: errorResponse,
        500: errorResponse
    }
};

// ✅ TASK MANAGEMENT SCHEMAS

// Add Task to Plan Schema
const addTaskToPlan = {
    description: 'Thêm task vào kế hoạch',
    tags: ['Tasks'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['planId'],
        properties: {
            planId: { type: 'string', description: 'ID của kế hoạch' }
        }
    },
    body: {
        type: 'object',
        required: ['title'],
        properties: {
            title: { type: 'string', minLength: 1, maxLength: 200 },
            description: { type: 'string', maxLength: 1000 },
            status: {
                type: 'string',
                enum: ['todo', 'in-progress', 'review', 'completed'],
                default: 'todo'
            },
            priority: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'urgent'],
                default: 'medium'
            },
            dueDate: { type: 'string', format: 'date-time' },
            estimatedTime: { type: 'number', minimum: 0 },
            tags: {
                type: 'array',
                items: { type: 'string' }
            }
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: planObject
            }
        },
        404: errorResponse,
        500: errorResponse
    }
};

// Update Task in Plan Schema
const updateTaskInPlan = {
    description: 'Cập nhật task trong kế hoạch',
    tags: ['Tasks'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['planId', 'taskId'],
        properties: {
            planId: { type: 'string', description: 'ID của kế hoạch' },
            taskId: { type: 'string', description: 'ID của task' }
        }
    },
    body: {
        type: 'object',
        properties: {
            title: { type: 'string', minLength: 1, maxLength: 200 },
            description: { type: 'string', maxLength: 1000 },
            status: {
                type: 'string',
                enum: ['todo', 'in-progress', 'review', 'completed']
            },
            priority: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'urgent']
            },
            dueDate: { type: 'string', format: 'date-time' },
            estimatedTime: { type: 'number', minimum: 0 },
            actualTime: { type: 'number', minimum: 0 },
            tags: {
                type: 'array',
                items: { type: 'string' }
            }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: planObject
            }
        },
        404: errorResponse,
        500: errorResponse
    }
};

// Delete Task from Plan Schema
const deleteTaskFromPlan = {
    description: 'Xóa task khỏi kế hoạch',
    tags: ['Tasks'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['planId', 'taskId'],
        properties: {
            planId: { type: 'string', description: 'ID của kế hoạch' },
            taskId: { type: 'string', description: 'ID của task' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: planObject
            }
        },
        404: errorResponse,
        500: errorResponse
    }
};

// Bulk Update Tasks Schema
const bulkUpdateTasks = {
    description: 'Cập nhật nhiều task cùng lúc',
    tags: ['Tasks'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['planId'],
        properties: {
            planId: { type: 'string', description: 'ID của kế hoạch' }
        }
    },
    body: {
        type: 'object',
        required: ['tasks'],
        properties: {
            tasks: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'string' },
                        title: { type: 'string', minLength: 1, maxLength: 200 },
                        description: { type: 'string', maxLength: 1000 },
                        status: {
                            type: 'string',
                            enum: ['todo', 'in-progress', 'review', 'completed']
                        },
                        priority: {
                            type: 'string',
                            enum: ['low', 'medium', 'high', 'urgent']
                        },
                        dueDate: { type: 'string', format: 'date-time' },
                        estimatedTime: { type: 'number', minimum: 0 },
                        actualTime: { type: 'number', minimum: 0 }
                    }
                }
            }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: planObject
            }
        },
        400: errorResponse,
        404: errorResponse,
        500: errorResponse
    }
};

// Toggle Task Completion Schema
const toggleTaskCompletion = {
    description: 'Chuyển đổi trạng thái hoàn thành của task',
    tags: ['Tasks'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['planId', 'taskId'],
        properties: {
            planId: { type: 'string', description: 'ID của kế hoạch' },
            taskId: { type: 'string', description: 'ID của task' }
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
                        task: taskObject
                    }
                }
            }
        },
        404: errorResponse,
        500: errorResponse
    }
};

// Update Task Status Schema
const updateTaskStatus = {
    description: 'Cập nhật trạng thái task',
    tags: ['Tasks'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['planId', 'taskId'],
        properties: {
            planId: { type: 'string', description: 'ID của kế hoạch' },
            taskId: { type: 'string', description: 'ID của task' }
        }
    },
    body: {
        type: 'object',
        required: ['status'],
        properties: {
            status: {
                type: 'string',
                enum: ['todo', 'in-progress', 'completed', 'blocked']
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
                        task: taskObject
                    }
                }
            }
        },
        400: errorResponse,
        404: errorResponse,
        500: errorResponse
    }
};

// ✅ COLLABORATION SCHEMAS

// Add Collaborator to Plan Schema
const addCollaboratorToPlan = {
    description: 'Thêm cộng tác viên vào kế hoạch',
    tags: ['Collaboration'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['planId'],
        properties: {
            planId: { type: 'string', description: 'ID của kế hoạch' }
        }
    },
    body: {
        type: 'object',
        required: ['collaboratorUserId'],
        properties: {
            collaboratorUserId: { type: 'string', description: 'ID của người dùng được thêm' },
            role: {
                type: 'string',
                enum: ['owner', 'editor', 'viewer'],
                default: 'viewer'
            },
            permissions: {
                type: 'array',
                items: {
                    type: 'string',
                    enum: ['view', 'edit', 'delete', 'share', 'manage_tasks', 'manage_collaborators']
                },
                default: ['view']
            }
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: planObject
            }
        },
        400: errorResponse,
        403: errorResponse,
        404: errorResponse,
        500: errorResponse
    }
};

// Remove Collaborator from Plan Schema
const removeCollaboratorFromPlan = {
    description: 'Xóa cộng tác viên khỏi kế hoạch',
    tags: ['Collaboration'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['planId', 'userId'],
        properties: {
            planId: { type: 'string', description: 'ID của kế hoạch' },
            userId: { type: 'string', description: 'ID của cộng tác viên cần xóa' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: planObject
            }
        },
        403: errorResponse,
        404: errorResponse,
        500: errorResponse
    }
};

// Update Collaborator Permissions Schema
const updateCollaboratorPermissions = {
    description: 'Cập nhật quyền của cộng tác viên',
    tags: ['Collaboration'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['planId', 'userId'],
        properties: {
            planId: { type: 'string', description: 'ID của kế hoạch' },
            userId: { type: 'string', description: 'ID của cộng tác viên' }
        }
    },
    body: {
        type: 'object',
        properties: {
            role: {
                type: 'string',
                enum: ['owner', 'editor', 'viewer']
            },
            permissions: {
                type: 'array',
                items: {
                    type: 'string',
                    enum: ['view', 'edit', 'delete', 'share', 'manage_tasks', 'manage_collaborators']
                }
            }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: planObject
            }
        },
        403: errorResponse,
        404: errorResponse,
        500: errorResponse
    }
};

// ✅ ASSIGNMENT & COMMENTS SCHEMAS

// Assign Task Schema
const assignTask = {
    description: 'Phân công task cho người dùng',
    tags: ['Tasks'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['planId', 'taskId'],
        properties: {
            planId: { type: 'string', description: 'ID của kế hoạch' },
            taskId: { type: 'string', description: 'ID của task' }
        }
    },
    body: {
        type: 'object',
        required: ['assignedTo'],
        properties: {
            assignedTo: {
                type: 'array',
                items: { type: 'string' },
                description: 'Danh sách ID người dùng được phân công'
            },
            role: {
                type: 'string',
                enum: ['owner', 'collaborator', 'reviewer'],
                default: 'collaborator'
            }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: planObject
            }
        },
        400: errorResponse,
        404: errorResponse,
        500: errorResponse
    }
};

// Add Comment to Task Schema
const addCommentToTask = {
    description: 'Thêm comment vào task',
    tags: ['Tasks'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['planId', 'taskId'],
        properties: {
            planId: { type: 'string', description: 'ID của kế hoạch' },
            taskId: { type: 'string', description: 'ID của task' }
        }
    },
    body: {
        type: 'object',
        required: ['content'],
        properties: {
            content: {
                type: 'string',
                minLength: 1,
                maxLength: 1000,
                description: 'Nội dung comment'
            }
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: planObject
            }
        },
        400: errorResponse,
        404: errorResponse,
        500: errorResponse
    }
};

// ✅ DASHBOARD & MY TASKS SCHEMAS

// Get User Dashboard Schema
const getUserDashboard = {
    description: 'Lấy thông tin dashboard của người dùng',
    tags: ['Dashboard'],
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
                        stats: {
                            type: 'object',
                            properties: {
                                totalPlans: { type: 'number' },
                                activePlans: { type: 'number' },
                                completedPlans: { type: 'number' },
                                totalTasks: { type: 'number' },
                                completedTasks: { type: 'number' },
                                completionPercentage: { type: 'number' }
                            }
                        },
                        recentPlans: {
                            type: 'array',
                            items: planObject
                        },
                        upcomingTasks: {
                            type: 'array',
                            items: {
                                allOf: [
                                    taskObject,
                                    {
                                        type: 'object',
                                        properties: {
                                            planId: { type: 'string' },
                                            planTitle: { type: 'string' }
                                        }
                                    }
                                ]
                            }
                        },
                        summary: {
                            type: 'object',
                            properties: {
                                totalPlans: { type: 'number' },
                                activePlans: { type: 'number' },
                                completedPlans: { type: 'number' },
                                totalTasks: { type: 'number' },
                                completedTasks: { type: 'number' },
                                completionPercentage: { type: 'number' },
                                upcomingTasksCount: { type: 'number' }
                            }
                        }
                    }
                }
            }
        },
        500: errorResponse
    }
};

// Get My Tasks Schema
const getMyTasks = {
    description: 'Lấy danh sách task được phân công cho người dùng',
    tags: ['Tasks'],
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            status: {
                type: 'string',
                enum: ['todo', 'in-progress', 'review', 'completed']
            },
            priority: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'urgent']
            },
            page: { type: 'number', minimum: 1, default: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
            sortBy: {
                type: 'string',
                enum: ['dueDate', 'createdAt', 'updatedAt', 'priority', 'title'],
                default: 'dueDate'
            },
            sortOrder: {
                type: 'string',
                enum: ['asc', 'desc'],
                default: 'asc'
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
                    items: {
                        allOf: [
                            taskObject,
                            {
                                type: 'object',
                                properties: {
                                    planId: { type: 'string' },
                                    planTitle: { type: 'string' },
                                    planCategory: { type: 'string' },
                                    planOwner: { type: 'string' }
                                }
                            }
                        ]
                    }
                },
                pagination: paginationObject
            }
        },
        500: errorResponse
    }
};

// ✅ ADDITIONAL SCHEMAS

// Get Plans with Groups Schema
const getPlansWithGroups = {
    description: 'Lấy danh sách kế hoạch bao gồm nhóm',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number', minimum: 1, default: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
            search: { type: 'string' },
            category: {
                type: 'string',
                enum: ['personal', 'work', 'education', 'health', 'finance', 'travel', 'other']
            },
            status: {
                type: 'string',
                enum: ['draft', 'active', 'completed', 'archived']
            },
            priority: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'urgent']
            },
            includeGroups: { type: 'boolean', default: true },
            sortBy: {
                type: 'string',
                enum: ['createdAt', 'updatedAt', 'title', 'priority', 'status'],
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
                pagination: paginationObject
            }
        },
        500: errorResponse
    }
};

// Get Plans by Category Schema
const getPlansByCategory = {
    description: 'Lấy kế hoạch theo danh mục',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['category'],
        properties: {
            category: {
                type: 'string',
                enum: ['personal', 'work', 'education', 'health', 'finance', 'travel', 'other']
            }
        }
    },
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number', minimum: 1, default: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 10 }
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
                pagination: paginationObject
            }
        },
        500: errorResponse
    }
};

// Get Plans by Status Schema
const getPlansByStatus = {
    description: 'Lấy kế hoạch theo trạng thái',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['status'],
        properties: {
            status: {
                type: 'string',
                enum: ['draft', 'active', 'completed', 'archived']
            }
        }
    },
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number', minimum: 1, default: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 10 }
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
                pagination: paginationObject
            }
        },
        500: errorResponse
    }
};

// Get Plans by Priority Schema
const getPlansByPriority = {
    description: 'Lấy kế hoạch theo độ ưu tiên',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['priority'],
        properties: {
            priority: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'urgent']
            }
        }
    },
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number', minimum: 1, default: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 10 }
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
                pagination: paginationObject
            }
        },
        500: errorResponse
    }
};

// Get AI Generated Plans Schema
const getAIGeneratedPlans = {
    description: 'Lấy danh sách kế hoạch được tạo bởi AI',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number', minimum: 1, default: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 10 }
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
                pagination: paginationObject
            }
        },
        500: errorResponse
    }
};

// Get Manual Plans Schema
const getManualPlans = {
    description: 'Lấy danh sách kế hoạch được tạo thủ công',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number', minimum: 1, default: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 10 }
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
                pagination: paginationObject
            }
        },
        500: errorResponse
    }
};

// Search Plans Schema
const searchPlans = {
    description: 'Tìm kiếm kế hoạch',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['query'],
        properties: {
            query: { type: 'string', description: 'Từ khóa tìm kiếm' }
        }
    },
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number', minimum: 1, default: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 10 }
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
                pagination: paginationObject
            }
        },
        500: errorResponse
    }
};

// Get Recent Plans Schema
const getRecentPlans = {
    description: 'Lấy danh sách kế hoạch gần đây',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            limit: { type: 'number', minimum: 1, maximum: 50, default: 10 }
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
                pagination: paginationObject
            }
        },
        500: errorResponse
    }
};

// Get Archived Plans Schema
const getArchivedPlans = {
    description: 'Lấy danh sách kế hoạch đã lưu trữ',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number', minimum: 1, default: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 10 }
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
                pagination: paginationObject
            }
        },
        500: errorResponse
    }
};

// Archive Plan Schema
const archivePlan = {
    description: 'Lưu trữ kế hoạch',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', description: 'ID của kế hoạch' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: planObject
            }
        },
        404: errorResponse,
        500: errorResponse
    }
};

// Restore Plan Schema
const restorePlan = {
    description: 'Khôi phục kế hoạch từ lưu trữ',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', description: 'ID của kế hoạch' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: planObject
            }
        },
        404: errorResponse,
        500: errorResponse
    }
};

// Complete Plan Schema
const completePlan = {
    description: 'Đánh dấu kế hoạch hoàn thành',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', description: 'ID của kế hoạch' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: planObject
            }
        },
        404: errorResponse,
        500: errorResponse
    }
};

// Activate Plan Schema
const activatePlan = {
    description: 'Kích hoạt kế hoạch',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', description: 'ID của kế hoạch' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: planObject
            }
        },
        404: errorResponse,
        500: errorResponse
    }
};

// Get Plan Progress Schema
const getPlanProgress = {
    description: 'Lấy tiến độ thực hiện kế hoạch',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', description: 'ID của kế hoạch' }
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
                        planId: { type: 'string' },
                        title: { type: 'string' },
                        totalTasks: { type: 'number' },
                        completedTasks: { type: 'number' },
                        inProgressTasks: { type: 'number' },
                        todoTasks: { type: 'number' },
                        percentage: { type: 'number' },
                        status: { type: 'string' },
                        startDate: { type: ['string', 'null'], format: 'date-time' },
                        endDate: { type: ['string', 'null'], format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                }
            }
        },
        404: errorResponse,
        500: errorResponse
    }
};

// ✅ Export all schemas
module.exports = {
    // Basic CRUD
    createPlan,
    getPlans,
    getPlan,
    updatePlan,
    deletePlan,

    // Plan Management
    getPlanStats,
    duplicatePlan,
    sharePlan,
    exportPlan,
    getPlansWithGroups,

    // Task Management
    addTaskToPlan,
    updateTaskInPlan,
    deleteTaskFromPlan,
    bulkUpdateTasks,
    toggleTaskCompletion,
    updateTaskStatus,

    // Collaboration
    addCollaboratorToPlan,
    removeCollaboratorFromPlan,
    updateCollaboratorPermissions,

    // Assignment & Comments
    assignTask,
    addCommentToTask,

    // Dashboard & My Tasks
    getUserDashboard,
    getMyTasks,

    // Additional Routes
    getPlansByCategory,
    getPlansByStatus,
    getPlansByPriority,
    getAIGeneratedPlans,
    getManualPlans,
    searchPlans,
    getRecentPlans,
    getArchivedPlans,
    archivePlan,
    restorePlan,
    completePlan,
    activatePlan,
    getPlanProgress
};


