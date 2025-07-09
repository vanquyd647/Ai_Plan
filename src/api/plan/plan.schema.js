// schemas/plan/plan.schema.js - UPDATED VERSION

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

        // ✅ NEW: Assignment fields
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
                    assignedBy: { type: 'string' },
                    assignedByUser: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            email: { type: 'string' }
                        }
                    }
                }
            }
        },

        // ✅ NEW: Timeline fields
        startDate: { type: ['string', 'null'], format: 'date-time' },
        dueDate: { type: ['string', 'null'], format: 'date-time' },
        estimatedHours: { type: ['number', 'null'], minimum: 0 },
        actualHours: { type: ['number', 'null'], minimum: 0 },

        // ✅ NEW: Dependencies
        dependencies: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    taskId: { type: 'string' },
                    type: {
                        type: 'string',
                        enum: ['finish-to-start', 'start-to-start', 'finish-to-finish']
                    }
                }
            }
        },

        // ✅ NEW: Comments
        comments: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
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
                    content: { type: 'string' },
                    type: {
                        type: 'string',
                        enum: ['comment', 'status-update', 'assignment']
                    },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            }
        },

        // ✅ NEW: Attachments
        attachments: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    fileName: { type: 'string' },
                    fileUrl: { type: 'string' },
                    fileSize: { type: 'number' },
                    uploadedBy: { type: 'string' },
                    uploadedByUser: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' }
                        }
                    },
                    uploadedAt: { type: 'string', format: 'date-time' }
                }
            }
        },

        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
};

// ✅ Enhanced Plan Object with Group Support
const planObject = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
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

        // ✅ NEW: Group support
        groupId: { type: ['string', 'null'] },
        group: {
            type: ['object', 'null'],
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                avatar: { type: ['string', 'null'] }
            }
        },

        // ✅ ENHANCED: Tasks with full assignment support
        tasks: {
            type: 'array',
            items: taskObject
        },

        // ✅ NEW: Collaborators
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
                        enum: ['owner', 'editor', 'viewer', 'reviewer']
                    },
                    permissions: {
                        type: 'object',
                        properties: {
                            canEdit: { type: 'boolean' },
                            canAssignTasks: { type: 'boolean' },
                            canDeleteTasks: { type: 'boolean' },
                            canInviteOthers: { type: 'boolean' },
                            canViewReports: { type: 'boolean' }
                        }
                    },
                    addedAt: { type: 'string', format: 'date-time' },
                    addedBy: { type: 'string' }
                }
            }
        },

        // ✅ NEW: Progress tracking
        progress: {
            type: 'object',
            properties: {
                totalTasks: { type: 'number' },
                completedTasks: { type: 'number' },
                inProgressTasks: { type: 'number' },
                overdueTasks: { type: 'number' },
                percentComplete: { type: 'number', minimum: 0, maximum: 100 }
            }
        },

        // Existing fields
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
        createdBy: { type: 'string' },
        aiMetadata: {
            type: 'object',
            properties: {
                model: { type: 'string' },
                prompt: { type: 'string' },
                generatedAt: { type: 'string', format: 'date-time' },
                confidence: { type: 'number' }
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
        currentPage: { type: 'integer' },
        totalPages: { type: 'integer' },
        totalItems: { type: 'integer' },
        itemsPerPage: { type: 'integer' },
        hasNextPage: { type: 'boolean' },
        hasPrevPage: { type: 'boolean' }
    }
};

// ✅ UPDATED: Create Plan Schema with Group Support
exports.createPlan = {
    description: 'Tạo kế hoạch mới (cá nhân hoặc nhóm)',
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

            // ✅ NEW: Group support
            groupId: {
                type: ['string', 'null'],
                description: 'ID nhóm (null = kế hoạch cá nhân)'
            },

            // ✅ ENHANCED: Tasks with assignment support
            tasks: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        title: { type: 'string', minLength: 1 },
                        description: { type: 'string' },
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
                        startDate: { type: 'string', format: 'date-time' },
                        dueDate: { type: 'string', format: 'date-time' },
                        estimatedHours: { type: 'number', minimum: 0 },
                        assignedTo: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Danh sách user ID được phân công'
                        }
                    },
                    required: ['title']
                },
                description: 'Danh sách nhiệm vụ'
            },

            // ✅ NEW: Initial collaborators
            collaborators: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        userId: { type: 'string' },
                        role: {
                            type: 'string',
                            enum: ['editor', 'viewer', 'reviewer'],
                            default: 'viewer'
                        },
                        permissions: {
                            type: 'object',
                            properties: {
                                canEdit: { type: 'boolean', default: false },
                                canAssignTasks: { type: 'boolean', default: false },
                                canDeleteTasks: { type: 'boolean', default: false },
                                canInviteOthers: { type: 'boolean', default: false },
                                canViewReports: { type: 'boolean', default: true }
                            }
                        }
                    },
                    required: ['userId']
                }
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

// ✅ UPDATED: Get Plans Schema with Group Support
exports.getPlans = {
    description: 'Lấy danh sách kế hoạch của người dùng (bao gồm cả group plans)',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            search: { type: 'string', description: 'Tìm kiếm theo tiêu đề hoặc mô tả' },
            category: { type: 'string', description: 'Lọc theo danh mục' },
            status: {
                type: 'string',
                enum: ['draft', 'active', 'completed', 'archived'],
                description: 'Lọc theo trạng thái'
            },
            priority: {
                type: 'string',
                enum: ['low', 'medium', 'high'],
                description: 'Lọc theo độ ưu tiên'
            },
            groupId: {
                type: 'string',
                description: 'Lọc theo nhóm cụ thể'
            },
            includeGroups: {
                type: 'string',
                enum: ['true', 'false'],
                default: 'true',
                description: 'Bao gồm kế hoạch nhóm'
            },
            sortBy: {
                type: 'string',
                enum: ['createdAt', 'updatedAt', 'title', 'status', 'priority'],
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

// ✅ NEW: Add Task to Plan Schema
exports.addTaskToPlan = {
    description: 'Thêm nhiệm vụ mới vào kế hoạch',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            planId: { type: 'string' }
        },
        required: ['planId']
    },
    body: {
        type: 'object',
        properties: {
            title: { type: 'string', minLength: 1 },
            description: { type: 'string' },
            priority: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'urgent'],
                default: 'medium'
            },
            startDate: { type: 'string', format: 'date-time' },
            dueDate: { type: 'string', format: 'date-time' },
            estimatedHours: { type: 'number', minimum: 0 },
            assignedTo: {
                type: 'array',
                items: { type: 'string' },
                description: 'Danh sách user ID được phân công'
            },
            dependencies: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        taskId: { type: 'string' },
                        type: {
                            type: 'string',
                            enum: ['finish-to-start', 'start-to-start', 'finish-to-finish'],
                            default: 'finish-to-start'
                        }
                    },
                    required: ['taskId']
                }
            }
        },
        required: ['title']
    },
    response: {
        201: {
            ...standardResponse,
            properties: {
                ...standardResponse.properties,
                data: planObject
            }
        },
        404: errorResponse,
        403: errorResponse,
        500: errorResponse
    }
};

// ✅ NEW: Update Task in Plan Schema
exports.updateTaskInPlan = {
    description: 'Cập nhật nhiệm vụ trong kế hoạch',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            planId: { type: 'string' },
            taskId: { type: 'string' }
        },
        required: ['planId', 'taskId']
    },
    body: {
        type: 'object',
        properties: {
            title: { type: 'string', minLength: 1 },
            description: { type: 'string' },
            status: {
                type: 'string',
                enum: ['todo', 'in-progress', 'review', 'completed']
            },
            priority: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'urgent']
            },
            startDate: { type: 'string', format: 'date-time' },
            dueDate: { type: 'string', format: 'date-time' },
            estimatedHours: { type: 'number', minimum: 0 },
            actualHours: { type: 'number', minimum: 0 }
        }
    },
    response: {
        200: {
            ...standardResponse,
            properties: {
                ...standardResponse.properties,
                data: planObject
            }
        },
        404: errorResponse,
        403: errorResponse,
        500: errorResponse
    }
};

// ✅ NEW: Delete Task from Plan Schema
exports.deleteTaskFromPlan = {
    description: 'Xóa nhiệm vụ khỏi kế hoạch',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            planId: { type: 'string' },
            taskId: { type: 'string' }
        },
        required: ['planId', 'taskId']
    },
    response: {
        200: {
            ...standardResponse,
            properties: {
                ...standardResponse.properties,
                data: planObject
            }
        },
        404: errorResponse,
        403: errorResponse,
        500: errorResponse
    }
};

// ✅ NEW: User Dashboard Schema
exports.getUserDashboard = {
    description: 'Lấy dashboard thống kê cho user',
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
                        overview: {
                            type: 'object',
                            properties: {
                                totalPlans: { type: 'number' },
                                personalPlans: { type: 'number' },
                                groupPlans: { type: 'number' },
                                totalTasks: { type: 'number' },
                                overdueTasks: { type: 'number' },
                                upcomingTasks: { type: 'number' }
                            }
                        },
                        plansByStatus: {
                            type: 'object',
                            properties: {
                                draft: { type: 'number' },
                                active: { type: 'number' },
                                completed: { type: 'number' },
                                archived: { type: 'number' }
                            }
                        },
                        tasksByStatus: {
                            type: 'object',
                            properties: {
                                todo: { type: 'number' },
                                'in-progress': { type: 'number' },
                                review: { type: 'number' },
                                completed: { type: 'number' }
                            }
                        },
                        recentTasks: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    ...taskObject.properties,
                                    planId: { type: 'string' },
                                    planTitle: { type: 'string' }
                                }
                            }
                        },
                        overdueTasks: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    ...taskObject.properties,
                                    planId: { type: 'string' },
                                    planTitle: { type: 'string' }
                                }
                            }
                        },
                        upcomingTasks: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    ...taskObject.properties,
                                    planId: { type: 'string' },
                                    planTitle: { type: 'string' }
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

// ✅ KEEP ALL EXISTING SCHEMAS (Updated with enhanced planObject)

// Save AI Generated Plan Schema 
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
            },
            groupId: {
                type: ['string', 'null'],
                description: 'ID nhóm (nếu tạo cho nhóm)'
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

// Get Single Plan Schema
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

// Update Plan Schema
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

// Delete Plan Schema
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

// Get Plan Statistics Schema
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
                        archivedPlans: { type: 'integer' },
                        aiGeneratedPlans: { type: 'integer' },
                        manualPlans: { type: 'integer' },
                        groupPlans: { type: 'integer' },
                        personalPlans: { type: 'integer' },
                        completionRate: { type: 'integer', description: 'Tỷ lệ hoàn thành (%)' },

                        // ✅ NEW: Task statistics
                        taskStats: {
                            type: 'object',
                            properties: {
                                totalTasks: { type: 'integer' },
                                completedTasks: { type: 'integer' },
                                inProgressTasks: { type: 'integer' },
                                overdueTasks: { type: 'integer' },
                                assignedToMe: { type: 'integer' },
                                assignedByMe: { type: 'integer' }
                            }
                        },

                        // ✅ NEW: Monthly statistics
                        monthlyStats: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    month: { type: 'string' },
                                    plansCreated: { type: 'integer' },
                                    plansCompleted: { type: 'integer' },
                                    tasksCompleted: { type: 'integer' }
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

// Duplicate Plan Schema
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
            },
            groupId: {
                type: ['string', 'null'],
                description: 'ID nhóm đích (null = kế hoạch cá nhân)'
            },
            includeCollaborators: {
                type: 'boolean',
                default: false,
                description: 'Sao chép cả danh sách cộng tác viên'
            },
            includeTasks: {
                type: 'boolean',
                default: true,
                description: 'Sao chép cả danh sách nhiệm vụ'
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

// Share Plan Schema
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
                enum: ['view', 'edit', 'comment'],
                default: 'view',
                description: 'Loại quyền chia sẻ'
            },
            expiresIn: {
                type: 'string',
                enum: ['1h', '1d', '7d', '30d', 'never'],
                default: '7d',
                description: 'Thời gian hết hạn'
            },
            allowDownload: {
                type: 'boolean',
                default: false,
                description: 'Cho phép tải xuống'
            },
            requirePassword: {
                type: 'boolean',
                default: false,
                description: 'Yêu cầu mật khẩu'
            },
            password: {
                type: 'string',
                minLength: 4,
                description: 'Mật khẩu bảo vệ (nếu requirePassword = true)'
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
                        expiresAt: { type: ['string', 'null'], format: 'date-time' },
                        allowDownload: { type: 'boolean' },
                        requirePassword: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' }
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

// Export Plan Schema
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
                enum: ['json', 'csv', 'pdf', 'xlsx'],
                default: 'json',
                description: 'Định dạng xuất file'
            },
            includeComments: {
                type: 'boolean',
                default: false,
                description: 'Bao gồm bình luận'
            },
            includeProgress: {
                type: 'boolean',
                default: true,
                description: 'Bao gồm thông tin tiến độ'
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
                },
                {
                    // XLSX format
                    type: 'string',
                    contentMediaType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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

// ✅ NEW: Add Collaborator to Plan Schema
exports.addCollaboratorToPlan = {
    description: 'Thêm cộng tác viên vào kế hoạch',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            planId: { type: 'string' }
        },
        required: ['planId']
    },
    body: {
        type: 'object',
        properties: {
            userId: { type: 'string' },
            role: {
                type: 'string',
                enum: ['editor', 'viewer', 'reviewer'],
                default: 'viewer'
            },
            permissions: {
                type: 'object',
                properties: {
                    canEdit: { type: 'boolean', default: false },
                    canAssignTasks: { type: 'boolean', default: false },
                    canDeleteTasks: { type: 'boolean', default: false },
                    canInviteOthers: { type: 'boolean', default: false },
                    canViewReports: { type: 'boolean', default: true }
                }
            },
            message: {
                type: 'string',
                description: 'Tin nhắn mời tham gia'
            }
        },
        required: ['userId']
    },
    response: {
        200: {
            ...standardResponse,
            properties: {
                ...standardResponse.properties,
                data: planObject
            }
        },
        404: errorResponse,
        403: errorResponse,
        400: errorResponse,
        500: errorResponse
    }
};

// ✅ NEW: Remove Collaborator from Plan Schema
exports.removeCollaboratorFromPlan = {
    description: 'Xóa cộng tác viên khỏi kế hoạch',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            planId: { type: 'string' },
            userId: { type: 'string' }
        },
        required: ['planId', 'userId']
    },
    response: {
        200: {
            ...standardResponse,
            properties: {
                ...standardResponse.properties,
                data: planObject
            }
        },
        404: errorResponse,
        403: errorResponse,
        500: errorResponse
    }
};

// ✅ NEW: Update Collaborator Permissions Schema
exports.updateCollaboratorPermissions = {
    description: 'Cập nhật quyền của cộng tác viên',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            planId: { type: 'string' },
            userId: { type: 'string' }
        },
        required: ['planId', 'userId']
    },
    body: {
        type: 'object',
        properties: {
            role: {
                type: 'string',
                enum: ['editor', 'viewer', 'reviewer']
            },
            permissions: {
                type: 'object',
                properties: {
                    canEdit: { type: 'boolean' },
                    canAssignTasks: { type: 'boolean' },
                    canDeleteTasks: { type: 'boolean' },
                    canInviteOthers: { type: 'boolean' },
                    canViewReports: { type: 'boolean' }
                }
            }
        }
    },
    response: {
        200: {
            ...standardResponse,
            properties: {
                ...standardResponse.properties,
                data: planObject
            }
        },
        404: errorResponse,
        403: errorResponse,
        500: errorResponse
    }
};

// ✅ NEW: Assign Task Schema
exports.assignTask = {
    description: 'Phân công nhiệm vụ cho người dùng',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            planId: { type: 'string' },
            taskId: { type: 'string' }
        },
        required: ['planId', 'taskId']
    },
    body: {
        type: 'object',
        properties: {
            assignedUserIds: {
                type: 'array',
                items: { type: 'string' },
                minItems: 1,
                description: 'Danh sách user ID được phân công'
            },
            role: {
                type: 'string',
                enum: ['owner', 'collaborator', 'reviewer'],
                default: 'collaborator'
            },
            comment: {
                type: 'string',
                description: 'Ghi chú khi phân công'
            },
            dueDate: {
                type: 'string',
                format: 'date-time',
                description: 'Hạn hoàn thành (tùy chọn)'
            }
        },
        required: ['assignedUserIds']
    },
    response: {
        200: {
            ...standardResponse,
            properties: {
                ...standardResponse.properties,
                data: planObject
            }
        },
        404: errorResponse,
        403: errorResponse,
        400: errorResponse,
        500: errorResponse
    }
};

// ✅ NEW: Add Comment to Task Schema
exports.addCommentToTask = {
    description: 'Thêm bình luận vào nhiệm vụ',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            planId: { type: 'string' },
            taskId: { type: 'string' }
        },
        required: ['planId', 'taskId']
    },
    body: {
        type: 'object',
        properties: {
            content: {
                type: 'string',
                minLength: 1,
                description: 'Nội dung bình luận'
            },
            type: {
                type: 'string',
                enum: ['comment', 'status-update', 'assignment'],
                default: 'comment',
                description: 'Loại bình luận'
            }
        },
        required: ['content']
    },
    response: {
        200: {
            ...standardResponse,
            properties: {
                ...standardResponse.properties,
                data: planObject
            }
        },
        404: errorResponse,
        403: errorResponse,
        500: errorResponse
    }
};

// ✅ NEW: Get My Tasks Schema
exports.getMyTasks = {
    description: 'Lấy danh sách nhiệm vụ được phân công cho tôi',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            status: {
                type: 'string',
                enum: ['todo', 'in-progress', 'review', 'completed'],
                description: 'Lọc theo trạng thái'
            },
            priority: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'urgent'],
                description: 'Lọc theo độ ưu tiên'
            },
            overdue: {
                type: 'boolean',
                description: 'Chỉ lấy nhiệm vụ quá hạn'
            },
            planId: {
                type: 'string',
                description: 'Lọc theo kế hoạch cụ thể'
            },
            sortBy: {
                type: 'string',
                enum: ['dueDate', 'priority', 'createdAt', 'updatedAt'],
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
                        type: 'object',
                        properties: {
                            planId: { type: 'string' },
                            planTitle: { type: 'string' },
                            planGroup: {
                                type: ['object', 'null'],
                                properties: {
                                    id: { type: 'string' },
                                    name: { type: 'string' }
                                }
                            },
                            task: taskObject,
                            myRole: { type: 'string' },
                            assignedAt: { type: 'string', format: 'date-time' }
                        }
                    }
                },
                pagination: paginationObject
            }
        },
        500: errorResponse
    }
};

// ✅ NEW: Bulk Update Tasks Schema
exports.bulkUpdateTasks = {
    description: 'Cập nhật hàng loạt nhiệm vụ',
    tags: ['Plans'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            planId: { type: 'string' }
        },
        required: ['planId']
    },
    body: {
        type: 'object',
        properties: {
            taskIds: {
                type: 'array',
                items: { type: 'string' },
                minItems: 1,
                description: 'Danh sách ID nhiệm vụ cần cập nhật'
            },
            updates: {
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
                    assignedTo: {
                        type: 'array',
                        items: { type: 'string' }
                    },
                    dueDate: { type: 'string', format: 'date-time' }
                },
                minProperties: 1
            }
        },
        required: ['taskIds', 'updates']
    },
    response: {
        200: {
            ...standardResponse,
            properties: {
                ...standardResponse.properties,
                data: {
                    type: 'object',
                    properties: {
                        updatedCount: { type: 'number' },
                        plan: planObject
                    }
                }
            }
        },
        404: errorResponse,
        403: errorResponse,
        400: errorResponse,
        500: errorResponse
    }
};

// ✅ Export all objects and schemas
module.exports = {
    // Base objects
    standardResponse,
    errorResponse,
    planObject,
    taskObject,
    paginationObject,
    
    // Plan CRUD schemas
    createPlan: exports.createPlan,
    getPlans: exports.getPlans,
    getPlan: exports.getPlan,
    updatePlan: exports.updatePlan,
    deletePlan: exports.deletePlan,
    
    // AI & Special features
    saveAIGeneratedPlan: exports.saveAIGeneratedPlan,
    getPlanStats: exports.getPlanStats,
    duplicatePlan: exports.duplicatePlan,
    sharePlan: exports.sharePlan,
    exportPlan: exports.exportPlan,
    
    // ✅ NEW: Task Management schemas
    addTaskToPlan: exports.addTaskToPlan,
    updateTaskInPlan: exports.updateTaskInPlan,
    deleteTaskFromPlan: exports.deleteTaskFromPlan,
    bulkUpdateTasks: exports.bulkUpdateTasks,
    
    // ✅ NEW: Collaboration schemas
    addCollaboratorToPlan: exports.addCollaboratorToPlan,
    removeCollaboratorFromPlan: exports.removeCollaboratorFromPlan,
    updateCollaboratorPermissions: exports.updateCollaboratorPermissions,
    
    // ✅ NEW: Assignment & Comments schemas
    assignTask: exports.assignTask,
    addCommentToTask: exports.addCommentToTask,
    
    // ✅ NEW: Dashboard & My Tasks schemas
    getUserDashboard: exports.getUserDashboard,
    getMyTasks: exports.getMyTasks
};
