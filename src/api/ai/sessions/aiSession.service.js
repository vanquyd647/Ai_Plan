const AIInteraction = require('../../../models/AIInteraction');

// ✅ Tạo AI session mới
exports.createSession = async (userId, type, prompt) => {
    try {
        const session = new AIInteraction({
            userId: userId,
            type: type,
            prompt: prompt,
            status: 'pending'
        });

        await session.save();
        return session;
    } catch (error) {
        console.error('❌ Create AI session error:', error.message);
        throw error;
    }
};

// ✅ Cập nhật AI session với response
exports.updateSession = async (sessionId, responseData) => {
    try {
        const session = await AIInteraction.findByIdAndUpdate(
            sessionId,
            {
                rawResponse: responseData.rawResponse,
                parsedResponse: responseData.parsedResponse,
                status: 'completed',
                metadata: responseData.metadata
            },
            { new: true }
        );

        if (!session) {
            throw new Error('AI session not found');
        }

        return session;
    } catch (error) {
        console.error('❌ Update AI session error:', error.message);
        throw error;
    }
};

// ✅ Lấy AI session theo ID
exports.getSession = async (sessionId, userId = null) => {
    try {
        const filter = { _id: sessionId };
        if (userId) {
            filter.userId = userId;
        }

        const session = await AIInteraction.findOne(filter);
        
        if (!session) {
            throw new Error('AI session not found');
        }

        return session;
    } catch (error) {
        console.error('❌ Get AI session error:', error.message);
        throw error;
    }
};

// ✅ Đánh dấu session thất bại
exports.markSessionFailed = async (sessionId, error) => {
    try {
        const session = await AIInteraction.findByIdAndUpdate(
            sessionId,
            {
                status: 'failed',
                error: {
                    message: error.message,
                    stack: error.stack,
                    timestamp: new Date()
                }
            },
            { new: true }
        );

        return session;
    } catch (dbError) {
        console.error('❌ Mark session failed error:', dbError.message);
        throw dbError;
    }
};

// ✅ Lấy các session active của user
exports.getActiveSessions = async (userId, limit = 10) => {
    try {
        const sessions = await AIInteraction.find({
            userId: userId,
            status: { $in: ['pending', 'completed'] }
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('type prompt status createdAt metadata');

        return sessions;
    } catch (error) {
        console.error('❌ Get active sessions error:', error.message);
        throw error;
    }
};
