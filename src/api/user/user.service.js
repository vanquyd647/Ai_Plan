const User = require('../../models/User');

exports.getUserById = async (id) => {
    const user = await User.findById(id).select('-password'); // Không trả về password
    if (!user) throw new Error('Người dùng không tồn tại');
    return user;
};

exports.updateUser = async (id, updatedData) => {
    const user = await User.findByIdAndUpdate(id, updatedData, { new: true }).select('-password');
    if (!user) throw new Error('Không thể cập nhật thông tin người dùng');
    return user;
};
