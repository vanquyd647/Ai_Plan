const UserService = require('./user.service');
const User = require('../../models/User');

exports.getUserProfile = async (request, reply) => {
    try {
        const userId = request.user.userId;
        const userProfile = await UserService.getUserById(userId);
        
        return reply.status(200).send({
            success: true,
            message: 'Lấy thông tin người dùng thành công',
            data: userProfile
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        return reply.status(500).send({
            success: false,
            message: error.message || 'Lỗi server khi lấy thông tin người dùng',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// ✅ NEW: Get user settings
exports.getUserSettings = async (request, reply) => {
    try {
        const userId = request.user.userId;
        const settings = await UserService.getUserSettings(userId);
        
        return reply.status(200).send({
            success: true,
            message: 'Lấy cài đặt người dùng thành công',
            data: settings
        });
    } catch (error) {
        console.error('Get user settings error:', error);
        return reply.status(500).send({
            success: false,
            message: error.message || 'Lỗi server khi lấy cài đặt',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// ✅ NEW: Get user security info
exports.getUserSecurity = async (request, reply) => {
    try {
        const userId = request.user.userId;
        const security = await UserService.getUserSecurity(userId);
        
        return reply.status(200).send({
            success: true,
            message: 'Lấy thông tin bảo mật thành công',
            data: security
        });
    } catch (error) {
        console.error('Get user security error:', error);
        return reply.status(500).send({
            success: false,
            message: error.message || 'Lỗi server khi lấy thông tin bảo mật',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// ✅ NEW: Update user profile
exports.updateUserProfile = async (request, reply) => {
    try {
        const userId = request.user.userId;
        const updates = request.body;
        
        const updatedUser = await UserService.updateUserProfile(userId, updates);
        
        return reply.status(200).send({
            success: true,
            message: 'Cập nhật thông tin thành công',
            data: updatedUser
        });
    } catch (error) {
        console.error('Update user profile error:', error);
        
        if (error.name === 'ValidationError') {
            return reply.status(400).send({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        
        return reply.status(500).send({
            success: false,
            message: error.message || 'Lỗi server khi cập nhật thông tin',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// ✅ NEW: Update user settings
exports.updateUserSettings = async (request, reply) => {
    try {
        const userId = request.user.userId;
        const { preferences, notifications, privacy } = request.body;
        
        const updateData = {};
        if (preferences) updateData.preferences = preferences;
        if (notifications) updateData.notifications = notifications;
        if (privacy) updateData.privacy = privacy;
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { ...updateData, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).select('preferences notifications privacy');
        
        return reply.status(200).send({
            success: true,
            message: 'Cập nhật cài đặt thành công',
            data: updatedUser
        });
    } catch (error) {
        console.error('Update user settings error:', error);
        return reply.status(500).send({
            success: false,
            message: error.message || 'Lỗi server khi cập nhật cài đặt',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// ✅ NEW: Revoke refresh token (logout from specific device)
exports.revokeRefreshToken = async (request, reply) => {
    try {
        const userId = request.user.userId;
        const { tokenId } = request.params;
        
        const user = await User.findById(userId);
        if (!user) {
            return reply.status(404).send({
                success: false,
                message: 'Người dùng không tồn tại'
            });
        }
        
        // Remove specific refresh token
        user.refreshTokens = user.refreshTokens.filter(
            token => token._id.toString() !== tokenId
        );
        
        await user.save();
        
        return reply.status(200).send({
            success: true,
            message: 'Đã đăng xuất khỏi thiết bị thành công'
        });
    } catch (error) {
        console.error('Revoke refresh token error:', error);
        return reply.status(500).send({
            success: false,
            message: error.message || 'Lỗi server khi đăng xuất thiết bị',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// ✅ NEW: Revoke all refresh tokens (logout from all devices)
exports.revokeAllRefreshTokens = async (request, reply) => {
    try {
        const userId = request.user.userId;
        
        await User.findByIdAndUpdate(userId, {
            refreshTokens: [],
            updatedAt: new Date()
        });
        
        return reply.status(200).send({
            success: true,
            message: 'Đã đăng xuất khỏi tất cả thiết bị thành công'
        });
    } catch (error) {
        console.error('Revoke all refresh tokens error:', error);
        return reply.status(500).send({
            success: false,
            message: error.message || 'Lỗi server khi đăng xuất tất cả thiết bị',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// ✅ NEW: Delete user account
exports.deleteUserAccount = async (request, reply) => {
    try {
        const userId = request.user.userId;
        const { password } = request.body;
        
        const user = await User.findById(userId);
        if (!user) {
            return reply.status(404).send({
                success: false,
                message: 'Người dùng không tồn tại'
            });
        }
        
        // Verify password for local accounts
        if (user.authProvider === 'local' && user.password) {
            const bcrypt = require('bcrypt');
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return reply.status(400).send({
                    success: false,
                    message: 'Mật khẩu không chính xác'
                });
            }
        }
        
        // Soft delete - mark as inactive instead of actual deletion
        await User.findByIdAndUpdate(userId, {
            isActive: false,
            email: `deleted_${Date.now()}_${user.email}`,
            refreshTokens: [],
            updatedAt: new Date()
        });
        
        return reply.status(200).send({
            success: true,
            message: 'Tài khoản đã được xóa thành công'
        });
    } catch (error) {
        console.error('Delete user account error:', error);
        return reply.status(500).send({
            success: false,
            message: error.message || 'Lỗi server khi xóa tài khoản',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
