const AIInteraction = require('../../../models/AIInteraction');

/**
 * Tạo session AI mới
 */
exports.createSession = async (data) => {
    const session = new AIInteraction(data);
    return await session.save();
};

/**
 * Lấy session AI theo ID
 */
exports.getSessionById = async (id) => {
    return await AIInteraction.findById(id);
};
