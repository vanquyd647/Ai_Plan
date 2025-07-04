const mongoose = require('mongoose');

const AIInteractionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['planner', 'writer', 'rewriter', 'summary'],
        required: true,
        index: true
    },
    prompt: {
        type: String,
        required: true,
        maxlength: 5000
    },
    formattedPrompt: {
        type: String,
        maxlength: 10000
    },
    rawResponse: {
        type: String,
        maxlength: 50000
    },
    parsedResponse: {
        type: mongoose.Schema.Types.Mixed // Flexible JSON data
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
        index: true
    },
    error: {
        message: String,
        stack: String,
        timestamp: Date
    },
    metadata: {
        responseTime: Number,
        tokenCount: Number,
        model: String,
        version: String,
        processingTime: Number
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better performance
AIInteractionSchema.index({ userId: 1, createdAt: -1 });
AIInteractionSchema.index({ userId: 1, type: 1, createdAt: -1 });
AIInteractionSchema.index({ status: 1, createdAt: -1 });

// Virtual for response summary
AIInteractionSchema.virtual('summary').get(function() {
    if (this.parsedResponse && this.parsedResponse.title) {
        return this.parsedResponse.title;
    }
    return this.prompt.substring(0, 100) + '...';
});

// Method to get safe data for API response
AIInteractionSchema.methods.toSafeObject = function() {
    return {
        id: this._id,
        type: this.type,
        prompt: this.prompt,
        response: this.parsedResponse || this.rawResponse,
        status: this.status,
        createdAt: this.createdAt,
        summary: this.summary,
        metadata: this.metadata
    };
};

module.exports = mongoose.model('AIInteraction', AIInteractionSchema);
