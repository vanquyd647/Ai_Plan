const UserService = require('./user.service');

exports.getUserProfile = async (req, reply) => {
    try {
        const userId = req.user.id; // Lấy user từ middleware xác thực
        const user = await UserService.getUserById(userId);

        return reply.code(200).send({
            success: true,
            data: user,
        });
    } catch (error) {
        return reply.code(400).send({ success: false, message: error.message });
    }
};

exports.updateUserProfile = async (req, reply) => {
    try {
        const userId = req.user.id;
        const updatedData = req.body;

        const user = await UserService.updateUser(userId, updatedData);

        return reply.code(200).send({
            success: true,
            message: 'Cập nhật thông tin người dùng thành công',
            data: user,
        });
    } catch (error) {
        return reply.code(400).send({ success: false, message: error.message });
    }
};
