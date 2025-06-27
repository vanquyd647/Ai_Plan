const bcrypt = require('bcrypt');
const jwt = require('../../utils/jwt'); // Helper JWT
const User = require('../../models/User'); // Model User
const environment = require('../../config/environment'); // Config

// Xử lý đăng nhập
exports.login = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Người dùng không tồn tại');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Mật khẩu không đúng');
    }

    // Tạo token JWT
    const token = jwt.generateToken({ id: user._id, email: user.email });
    return { user, token };
};

// Xử lý đăng ký
exports.register = async (name, email, password) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('Email đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    // Tạo token JWT
    const token = jwt.generateToken({ id: user._id, email: user.email });
    return { user, token };
};
