require('dotenv').config(); // Load các biến môi trường từ file .env

module.exports = {
    // Cấu hình môi trường
    isProd: process.env.NODE_ENV === 'production',
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',

    // Cấu hình JWT
    JWT_SECRET: process.env.JWT_SECRET || 'your_default_jwt_secret', // Key bí mật cho JWT
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d', // Thời gian hết hạn token
};
