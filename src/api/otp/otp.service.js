'use strict';

const OTP = require('../../models/Otp');
const nodemailer = require('nodemailer');
const twilio = require('twilio'); // Nếu dùng SMS

/**
 * OTP Service
 * Xử lý logic nghiệp vụ cho OTP
 */
class OTPService {
    constructor() {
        // Memory cache cho rate limiting
        this.rateLimitCache = new Map();
        this.cleanupInterval = setInterval(() => {
            this.cleanupRateLimit();
        }, 60 * 1000); // Cleanup mỗi phút

        // Email transporter
        this.emailTransporter = this.createEmailTransporter();

        // SMS client (nếu có)
        this.smsClient = this.createSMSClient();
    }

    /**
     * Tạo OTP mới
     */
    async create(options) {
        const {
            identifier,
            type,
            userId = null,
            length = 6,
            codeType = 'numeric',
            maxAttempts = 5,
            ip = null,
            userAgent = null,
            extra = {},
            autoSend = true
        } = options;

        try {
            // Kiểm tra rate limit
            this.checkRateLimit(identifier, type);

            // Hủy OTP cũ cùng loại
            await OTP.invalidateExisting(identifier, type);

            // Tạo mã OTP
            const code = OTP.generateCode(length, codeType);
            const expiryDuration = OTP.getExpiryDuration(type);
            const expiresAt = new Date(Date.now() + expiryDuration);

            // Tạo OTP record
            const otpData = {
                code,
                identifier: identifier.toLowerCase(),
                type,
                expiresAt,
                maxAttempts,
                userId,
                metadata: {
                    createdIP: ip,
                    userAgent,
                    extra,
                    deliveryMethod: this.getDeliveryMethod(identifier),
                    deliveryStatus: 'pending'
                }
            };

            const otp = new OTP(otpData);
            await otp.save();

            // Gửi OTP tự động
            if (autoSend) {
                await this.send(otp);
            }

            // Cập nhật rate limit
            this.updateRateLimit(identifier, type);

            return {
                success: true,
                message: 'OTP đã được tạo và gửi thành công',
                data: {
                    id: otp._id,
                    identifier: otp.identifier,
                    type: otp.type,
                    expiresAt: otp.expiresAt,
                    timeRemaining: otp.timeRemaining,
                    maxAttempts: otp.maxAttempts,
                    deliveryMethod: otp.metadata.deliveryMethod
                }
            };

        } catch (error) {
            throw new Error(`Lỗi tạo OTP: ${error.message}`);
        }
    }

    /**
     * Xác thực OTP
     */
    async verify(identifier, code, type) {
        try {
            // Tìm OTP active
            const otp = await OTP.findActiveOTP(identifier, type);

            if (!otp) {
                throw new Error('Không tìm thấy OTP hợp lệ hoặc OTP đã hết hạn');
            }

            // Xác thực
            const isValid = otp.verify(code);
            await otp.save();

            if (!isValid) {
                throw new Error(`Mã OTP không chính xác. Còn lại ${otp.maxAttempts - otp.attempts} lần thử`);
            }

            return {
                success: true,
                message: 'Xác thực OTP thành công',
                data: {
                    id: otp._id,
                    identifier: otp.identifier,
                    type: otp.type,
                    verifiedAt: otp.verifiedAt,
                    userId: otp.userId
                }
            };

        } catch (error) {
            throw new Error(`Lỗi xác thực OTP: ${error.message}`);
        }
    }

    /**
     * Gửi lại OTP
     */
    async resend(identifier, type) {
        try {
            // Kiểm tra rate limit
            this.checkRateLimit(identifier, type, 'resend');

            // Tìm OTP hiện tại
            const otp = await OTP.findActiveOTP(identifier, type);

            if (!otp) {
                throw new Error('Không tìm thấy OTP để gửi lại');
            }

            // Gửi lại
            await this.send(otp);

            // Cập nhật rate limit
            this.updateRateLimit(identifier, type, 'resend');

            return {
                success: true,
                message: 'OTP đã được gửi lại thành công',
                data: {
                    id: otp._id,
                    timeRemaining: otp.timeRemaining
                }
            };

        } catch (error) {
            throw new Error(`Lỗi gửi lại OTP: ${error.message}`);
        }
    }

    /**
     * Hủy OTP
     */
    async cancel(identifier, type, reason = null) {
        try {
            const otp = await OTP.findActiveOTP(identifier, type);

            if (!otp) {
                throw new Error('Không tìm thấy OTP để hủy');
            }

            otp.cancel(reason);
            await otp.save();

            return {
                success: true,
                message: 'OTP đã được hủy thành công',
                data: {
                    id: otp._id,
                    cancelledAt: otp.cancelledAt
                }
            };

        } catch (error) {
            throw new Error(`Lỗi hủy OTP: ${error.message}`);
        }
    }

    /**
     * Lấy thông tin OTP
     */
    async getInfo(identifier, type) {
        try {
            const otp = await OTP.findActiveOTP(identifier, type);

            if (!otp) {
                return {
                    success: false,
                    message: 'Không tìm thấy OTP active'
                };
            }

            return {
                success: true,
                data: {
                    id: otp._id,
                    identifier: otp.identifier,
                    type: otp.type,
                    status: otp.status,
                    attempts: otp.attempts,
                    maxAttempts: otp.maxAttempts,
                    timeRemaining: otp.timeRemaining,
                    isLocked: otp.isLocked,
                    canAttempt: otp.canAttempt,
                    createdAt: otp.createdAt,
                    expiresAt: otp.expiresAt
                }
            };

        } catch (error) {
            throw new Error(`Lỗi lấy thông tin OTP: ${error.message}`);
        }
    }

    /**
     * Gửi OTP
     */
    async send(otp) {
        try {
            const method = this.getDeliveryMethod(otp.identifier);

            if (method === 'email') {
                await this.sendEmail(otp);
            } else if (method === 'sms') {
                await this.sendSMS(otp);
            } else {
                throw new Error('Phương thức gửi không được hỗ trợ');
            }

            otp.markAsSent(method);
            await otp.save();

        } catch (error) {
            otp.markAsDeliveryFailed(error.message);
            await otp.save();
            throw error;
        }
    }

    /**
     * Gửi OTP qua email
     */
    async sendEmail(otp) {
        if (!this.emailTransporter) {
            throw new Error('Email transporter chưa được cấu hình');
        }

        const template = this.getEmailTemplate(otp.type);
        const subject = template.subject;
        const html = template.html.replace('{{code}}', otp.code)
            .replace('{{timeRemaining}}', Math.floor(otp.timeRemaining / 60));

        const mailOptions = {
            from: process.env.SMTP_FROM || 'noreply@yourapp.com',
            to: otp.identifier,
            subject,
            html
        };

        await this.emailTransporter.sendMail(mailOptions);
    }

    /**
     * Gửi OTP qua SMS
     */
    async sendSMS(otp) {
        if (!this.smsClient) {
            throw new Error('SMS client chưa được cấu hình');
        }

        const message = this.getSMSTemplate(otp.type, otp.code);

        await this.smsClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: otp.identifier
        });
    }

    /**
     * Kiểm tra rate limit
     */
    checkRateLimit(identifier, type, action = 'create') {
        const key = `${identifier}_${type}_${action}`;
        const now = Date.now();
        const limit = this.getRateLimit(type, action);

        if (!this.rateLimitCache.has(key)) {
            return true;
        }

        const attempts = this.rateLimitCache.get(key);
        const recentAttempts = attempts.filter(time => now - time < limit.window);

        if (recentAttempts.length >= limit.max) {
            throw new Error(`Quá nhiều yêu cầu. Vui lòng thử lại sau ${Math.ceil(limit.window / 60000)} phút`);
        }

        return true;
    }

    /**
     * Cập nhật rate limit
     */
    updateRateLimit(identifier, type, action = 'create') {
        const key = `${identifier}_${type}_${action}`;
        const now = Date.now();

        if (!this.rateLimitCache.has(key)) {
            this.rateLimitCache.set(key, []);
        }

        const attempts = this.rateLimitCache.get(key);
        attempts.push(now);

        // Giữ lại chỉ những attempts trong window
        const limit = this.getRateLimit(type, action);
        const validAttempts = attempts.filter(time => now - time < limit.window);
        this.rateLimitCache.set(key, validAttempts);
    }

    /**
     * Lấy cấu hình rate limit
     */
    getRateLimit(type, action) {
        const limits = {
            create: {
                'login_2fa': { max: 5, window: 5 * 60 * 1000 },      // 5 lần/5 phút
                'transaction': { max: 3, window: 10 * 60 * 1000 },   // 3 lần/10 phút
                'password_reset': { max: 3, window: 15 * 60 * 1000 }, // 3 lần/15 phút
                default: { max: 5, window: 10 * 60 * 1000 }           // 5 lần/10 phút
            },
            resend: {
                default: { max: 3, window: 5 * 60 * 1000 }            // 3 lần/5 phút
            }
        };

        return limits[action]?.[type] || limits[action]?.default || { max: 5, window: 10 * 60 * 1000 };
    }

    /**
     * Xác định phương thức gửi
     */
    getDeliveryMethod(identifier) {
        // Email pattern
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Phone pattern (simple)
        const phoneRegex = /^\+?[\d\s-()]+$/;

        if (emailRegex.test(identifier)) {
            return 'email';
        } else if (phoneRegex.test(identifier)) {
            return 'sms';
        } else {
            return 'email'; // Default
        }
    }

    /**
     * Tạo email transporter
     */
        createEmailTransporter() {
        if (!process.env.SMTP_HOST) {
            return null;
        }

        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    /**
     * Tạo SMS client
     */
    createSMSClient() {
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
            return null;
        }

        return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }

    /**
     * Template email
     */
    getEmailTemplate(type) {
        const templates = {
            'email_verification': {
                subject: 'Xác thực email của bạn',
                html: `
                    <h2>Xác thực email</h2>
                    <p>Mã xác thực của bạn là: <strong>{{code}}</strong></p>
                    <p>Mã này sẽ hết hạn sau {{timeRemaining}} phút.</p>
                `
            },
            'password_reset': {
                subject: 'Đặt lại mật khẩu',
                html: `
                    <h2>Đặt lại mật khẩu</h2>
                    <p>Mã xác thực để đặt lại mật khẩu: <strong>{{code}}</strong></p>
                    <p>Mã này sẽ hết hạn sau {{timeRemaining}} phút.</p>
                `
            },
            'login_2fa': {
                subject: 'Mã xác thực đăng nhập',
                html: `
                    <h2>Xác thực đăng nhập</h2>
                    <p>Mã xác thực 2 bước: <strong>{{code}}</strong></p>
                    <p>Mã này sẽ hết hạn sau {{timeRemaining}} phút.</p>
                `
            },
            default: {
                subject: 'Mã xác thực OTP',
                html: `
                    <h2>Mã xác thực</h2>
                    <p>Mã OTP của bạn là: <strong>{{code}}</strong></p>
                    <p>Mã này sẽ hết hạn sau {{timeRemaining}} phút.</p>
                `
            }
        };

        return templates[type] || templates.default;
    }

    /**
     * Template SMS
     */
    getSMSTemplate(type, code) {
        const templates = {
            'phone_verification': `Ma xac thuc so dien thoai: ${code}. Ma co hieu luc trong 10 phut.`,
            'login_2fa': `Ma xac thuc dang nhap: ${code}. Ma co hieu luc trong 5 phut.`,
            'transaction': `Ma xac thuc giao dich: ${code}. Ma co hieu luc trong 3 phut.`,
            default: `Ma OTP cua ban: ${code}. Vui long khong chia se ma nay.`
        };

        return templates[type] || templates.default;
    }

    /**
     * Cleanup rate limit cache
     */
    cleanupRateLimit() {
        const now = Date.now();
        const maxWindow = 60 * 60 * 1000; // 1 giờ

        for (const [key, attempts] of this.rateLimitCache.entries()) {
            const validAttempts = attempts.filter(time => now - time < maxWindow);

            if (validAttempts.length === 0) {
                this.rateLimitCache.delete(key);
            } else {
                this.rateLimitCache.set(key, validAttempts);
            }
        }
    }

    /**
     * Cleanup expired OTPs
     */
    async cleanupExpired() {
        try {
            const result = await OTP.cleanupExpired();
            console.log(`Cleaned up ${result.deletedCount} expired OTPs`);
            return result;
        } catch (error) {
            console.error('Error cleaning up expired OTPs:', error);
            throw error;
        }
    }

    /**
     * Thống kê OTP
     */
    async getStats(timeRange = '24h') {
        try {
            const now = new Date();
            let startTime;

            switch (timeRange) {
                case '1h':
                    startTime = new Date(now - 60 * 60 * 1000);
                    break;
                case '24h':
                    startTime = new Date(now - 24 * 60 * 60 * 1000);
                    break;
                case '7d':
                    startTime = new Date(now - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    startTime = new Date(now - 30 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startTime = new Date(now - 24 * 60 * 60 * 1000);
            }

            const stats = await OTP.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startTime }
                    }
                },
                {
                    $group: {
                        _id: {
                            type: '$type',
                            status: '$status'
                        },
                        count: { $sum: 1 },
                        avgAttempts: { $avg: '$attempts' }
                    }
                },
                {
                    $group: {
                        _id: '$_id.type',
                        total: { $sum: '$count' },
                        statuses: {
                            $push: {
                                status: '$_id.status',
                                count: '$count',
                                avgAttempts: '$avgAttempts'
                            }
                        }
                    }
                }
            ]);

            return {
                success: true,
                data: {
                    timeRange,
                    startTime,
                    endTime: now,
                    stats
                }
            };

        } catch (error) {
            throw new Error(`Lỗi lấy thống kê OTP: ${error.message}`);
        }
    }

    /**
     * Destroy service
     */
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.rateLimitCache.clear();
    }
}

module.exports = new OTPService();

