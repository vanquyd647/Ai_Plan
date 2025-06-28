require('dotenv').config(); // Load các biến môi trường từ file .env

module.exports = {
    // Cấu hình môi trường
    isProd: process.env.NODE_ENV === 'production',
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',

    // Cấu hình JWT
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m', // 15 phút
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d', // 7 ngày
};
