// schemas/group/group.schema.js
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

// ✅ Enhanced Group object schema
const groupObject = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        avatar: { type: ['string', 'null'] },
        isPrivate: { type: 'boolean' },
        settings: {
            type: 'object',
            properties: {
                allowMemberInvite: { type: 'boolean' },
                requireApproval: { type: 'boolean' },
                allowPublicPlans: { type: 'boolean' }
            }
        },
        members: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    userId: { type: 'string' },
                    role: { type: 'string' },
                    permissions: { type: 'object' },
                    joinedAt: { type: 'string', format: 'date-time' }
                }
            }
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
};

// ✅ Task object schema
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
        assignedTo: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    userId: { type: 'string' },
                    role: { type: 'string' },
                    assignedAt: { type: 'string', format: 'date-time' },
                    assignedBy: { type: 'string' }
                }
            }
        },
        startDate: { type: ['string', 'null'], format: 'date-time' },
        dueDate: { type: ['string', 'null'], format: 'date-time' },
        estimatedHours: { type: ['number', 'null'] },
        actualHours: { type: ['number', 'null'] },
        comments: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    userId: { type: 'string' },
                    content: { type: 'string' },
                    type: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            }
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
};

// ✅ Group Plan object schema
const groupPlanObject = {
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
        groupId: { type: 'string' },
        userId: { type: 'string' },
        tasks: {
            type: 'array',
            items: taskObject
        },
        collaborators: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    userId: { type: 'string' },
                    role: { type: 'string' },
                    permissions: { type: 'object' },
                    addedAt: { type: 'string', format: 'date-time' }
                }
            }
        },
        progress: {
            type: 'object',
            properties: {
                totalTasks: { type: 'number' },
                completedTasks: { type: 'number' },
                inProgressTasks: { type: 'number' },
                overdueTasks: { type: 'number' },
                percentComplete: { type: 'number' }
            }
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
};

// ✅ Request/Response Schemas

// Parameters
const groupIdParam = {
    type: 'object',
    properties: {
        groupId: { type: 'string' }
    },
    required: ['groupId']
};

const groupPlanParams = {
    type: 'object',
    properties: {
        groupId: { type: 'string' },
        planId: { type: 'string' }
    },
    required: ['groupId', 'planId']
};

const taskParams = {
    type: 'object',
    properties: {
        groupId: { type: 'string' },
        planId: { type: 'string' },
        taskId: { type: 'string' }
    },
    required: ['groupId', 'planId', 'taskId']
};

// Request Bodies
const createGroupPlanBody = {
    type: 'object',
    properties: {
        title: { type: 'string', minLength: 1, maxLength: 200 },
        description: { type: 'string', minLength: 1 },
        category: { type: 'string' },
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
                    priority: { 
                        type: 'string', 
                        enum: ['low', 'medium', 'high', 'urgent'] 
                    },
                    dueDate: { type: 'string', format: 'date-time' },
                    estimatedHours: { type: 'number', minimum: 0 }
                },
                required: ['title']
            }
        }
    },
    required: ['title', 'description']
};

const updateGroupPlanBody = {
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
        }
    }
};

const assignTaskBody = {
    type: 'object',
    properties: {
        assignedUserIds: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1
        },
        role: { 
            type: 'string', 
            enum: ['owner', 'collaborator', 'reviewer'],
            default: 'collaborator'
        },
        comment: { type: 'string' }
    },
    required: ['assignedUserIds']
};

const updateTaskStatusBody = {
    type: 'object',
    properties: {
        status: { 
            type: 'string', 
            enum: ['todo', 'in-progress', 'review', 'completed'] 
        },
        comment: { type: 'string' }
    },
    required: ['status']
};

const addCommentBody = {
    type: 'object',
    properties: {
        content: { type: 'string', minLength: 1 }
    },
    required: ['content']
};

// Query Parameters
const getGroupPlansQuery = {
    type: 'object',
    properties: {
        page: { type: 'integer', minimum: 1, default: 1 },
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
        status: { 
            type: 'string', 
            enum: ['draft', 'active', 'completed', 'archived'] 
        },
        search: { type: 'string' },
        sortBy: { 
            type: 'string', 
            enum: ['createdAt', 'updatedAt', 'title', 'priority'],
            default: 'createdAt'
        },
        sortOrder: { 
            type: 'string', 
            enum: ['asc', 'desc'],
            default: 'desc'
        }
    }
};

const getMyTasksQuery = {
    type: 'object',
    properties: {
        page: { type: 'integer', minimum: 1, default: 1 },
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        status: { 
            type: 'string', 
            enum: ['todo', 'in-progress', 'review', 'completed'] 
        },
        priority: { 
            type: 'string', 
            enum: ['low', 'medium', 'high', 'urgent'] 
        },
        overdue: { type: 'boolean' },
        sortBy: { 
            type: 'string', 
            enum: ['dueDate', 'priority', 'createdAt', 'updatedAt'],
            default: 'dueDate'
        }
    }
};

// Response Schemas
const groupPlanResponse = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: groupPlanObject
    }
};

const groupPlansListResponse = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
            type: 'array',
            items: groupPlanObject
        },
        pagination: {
            type: 'object',
            properties: {
                page: { type: 'number' },
                limit: { type: 'number' },
                total: { type: 'number' },
                pages: { type: 'number' }
            }
        }
    }
};

const myTasksResponse = {
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
                    task: taskObject
                }
            }
        }
    }
};

const groupStatsResponse = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
            type: 'object',
            properties: {
                group: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        memberCount: { type: 'number' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                plans: {
                    type: 'object',
                    properties: {
                        total: { type: 'number' },
                        byStatus: { type: 'object' }
                    }
                },
                tasks: {
                    type: 'object',
                    properties: {
                        total: { type: 'number' },
                        byStatus: { type: 'object' }
                    }
                },
                members: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            user: { type: 'object' },
                            totalTasks: { type: 'number' },
                            completedTasks: { type: 'number' },
                            completionRate: { type: 'number' }
                        }
                    }
                }
            }
        }
    }
};

module.exports = {
    standardResponse,
    errorResponse,
    groupObject,
    taskObject,
    groupPlanObject,
    
    // Parameters
    groupIdParam,
    groupPlanParams,
    taskParams,
    
    // Request Bodies
    createGroupPlanBody,
    updateGroupPlanBody,
    assignTaskBody,
    updateTaskStatusBody,
    addCommentBody,
    
    // Query Parameters
    getGroupPlansQuery,
    getMyTasksQuery,
    
    // Response Schemas
    groupPlanResponse,
    groupPlansListResponse,
    myTasksResponse,
    groupStatsResponse
};
