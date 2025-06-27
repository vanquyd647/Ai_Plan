const AuthService = require('./auth.service');

exports.login = async (req, reply) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await AuthService.login(email, password);

        return reply.code(200).send({
            success: true,
            message: 'Đăng nhập thành công',
            token,
            user: { id: user._id, email: user.email, name: user.name },
        });
    } catch (error) {
        return reply.code(401).send({ success: false, message: error.message });
    }
};

exports.register = async (req, reply) => {
    try {
        const { name, email, password } = req.body;
        const { user, token } = await AuthService.register(name, email, password);

        return reply.code(201).send({
            success: true,
            message: 'Đăng ký thành công',
            token,
            user: { id: user._id, email: user.email, name: user.name },
        });
    } catch (error) {
        return reply.code(400).send({ success: false, message: error.message });
    }
};
