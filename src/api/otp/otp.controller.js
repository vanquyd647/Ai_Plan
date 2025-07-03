'use strict';

const otpService = require('./otp.service');
const OTP = require('../../models/Otp');

/**
 * OTP Controller
 * Xử lý các request liên quan đến OTP
 */
class OTPController {
    /**
     * Tạo OTP mới
     * POST /api/otp/generate
     */
    async generate(req, reply) {
        try {
            const {
                identifier,
                type,
                length = 6,
                codeType = 'numeric',
                maxAttempts = 5,
                extra = {},
                autoSend = true
            } = req.body;

            // Extract metadata
            const ip = req.ip || req.connection.remoteAddress;
            const userAgent = req.headers['user-agent'];
            const userId = req.user?.id || null;

            const result = await otpService.create({
                identifier,
                type,
                userId,
                length,
                codeType,
                maxAttempts,
                ip,
                userAgent,
                extra,
                autoSend
            });

            return reply.status(201).send(result);

        } catch (error) {
            req.log.error('OTP generate error:', error);
            return reply.status(400).send({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Xác thực OTP
     * POST /api/otp/verify
     */
    async verify(req, reply) {
        try {
            const { identifier, code, type } = req.body;

            const result = await otpService.verify(identifier, code, type);

            return reply.send(result);

        } catch (error) {
            req.log.error('OTP verify error:', error);
            return reply.status(400).send({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Gửi lại OTP
     * POST /api/otp/resend
     */
    async resend(req, reply) {
        try {
            const { identifier, type } = req.body;

            const result = await otpService.resend(identifier, type);

            return reply.send(result);

        } catch (error) {
            req.log.error('OTP resend error:', error);
            return reply.status(400).send({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Hủy OTP
     * POST /api/otp/cancel
     */
    async cancel(req, reply) {
        try {
            const { identifier, type, reason } = req.body;

            const result = await otpService.cancel(identifier, type, reason);

            return reply.send(result);

        } catch (error) {
            req.log.error('OTP cancel error:', error);
            return reply.status(400).send({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Lấy thông tin OTP
     * GET /api/otp/info/:identifier/:type
     */
    async getInfo(req, reply) {
        try {
            const { identifier, type } = req.params;

            const result = await otpService.getInfo(identifier, type);

            return reply.send(result);

        } catch (error) {
            req.log.error('OTP getInfo error:', error);
            return reply.status(400).send({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Lấy thống kê OTP (Admin only)
     * GET /api/otp/stats
     */
    async getStats(req, reply) {
        try {
            const { timeRange = '24h' } = req.query;

            const result = await otpService.getStats(timeRange);

            return reply.send(result);

        } catch (error) {
            req.log.error('OTP getStats error:', error);
            return reply.status(500).send({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Cleanup OTP hết hạn (Admin only)
     * POST /api/otp/cleanup
     */
    async cleanup(req, reply) {
        try {
            const result = await otpService.cleanupExpired();

            return reply.send({
                success: true,
                message: 'Cleanup thành công',
                data: {
                    deletedCount: result.deletedCount
                }
            });

        } catch (error) {
            req.log.error('OTP cleanup error:', error);
            return reply.status(500).send({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Lấy danh sách OTP (Admin only)
     * GET /api/otp/list
     */
    async list(req, reply) {
        try {
            const {
                page = 1,
                limit = 20,
                type,
                status,
                identifier
            } = req.query;

            // Build filter
            const filter = {};
            if (type) filter.type = type;
            if (status) filter.status = status;
            if (identifier) filter.identifier = new RegExp(identifier, 'i');

            // Calculate pagination
            const skip = (page - 1) * limit;
            
            // Get OTPs
            const [otps, total] = await Promise.all([
                OTP.find(filter)
                    .select('-code -__v')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                OTP.countDocuments(filter)
            ]);

            const pages = Math.ceil(total / limit);

            return reply.send({
                success: true,
                data: {
                    otps,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages
                    }
                }
            });

        } catch (error) {
            req.log.error('OTP list error:', error);
            return reply.status(500).send({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Xóa hàng loạt OTP (Admin only)
     * DELETE /api/otp/bulk-delete
     */
    async bulkDelete(req, reply) {
        try {
            const { filters, confirm } = req.body;

            if (!confirm) {
                return reply.status(400).send({
                    success: false,
                    message: 'Vui lòng xác nhận việc xóa'
                });
            }

            // Build delete filter
            const deleteFilter = {};
            
            if (filters.status && filters.status.length > 0) {
                deleteFilter.status = { $in: filters.status };
            }
            
            if (filters.type && filters.type.length > 0) {
                deleteFilter.type = { $in: filters.type };
            }
            
            if (filters.olderThan) {
                deleteFilter.createdAt = { $lt: new Date(filters.olderThan) };
            }

            const result = await OTP.deleteMany(deleteFilter);

            return reply.send({
                success: true,
                message: `Đã xóa ${result.deletedCount} OTP`,
                data: {
                    deletedCount: result.deletedCount
                }
            });

        } catch (error) {
            req.log.error('OTP bulk delete error:', error);
            return reply.status(500).send({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Lấy danh sách loại OTP
     * GET /api/otp/types
     */
    async getTypes(req, reply) {
        return reply.send({
            success: true,
            data: {
                types: [
                    { value: 'email_verification', label: 'Xác thực email', duration: '30 phút' },
                    { value: 'phone_verification', label: 'Xác thực số điện thoại', duration: '10 phút' },
                    { value: 'password_reset', label: 'Đặt lại mật khẩu', duration: '15 phút' },
                    { value: 'login_2fa', label: 'Xác thực 2 bước', duration: '5 phút' },
                    { value: 'transaction', label: 'Xác thực giao dịch', duration: '3 phút' },
                    { value: 'withdrawal', label: 'Rút tiền', duration: '5 phút' },
                    { value: 'account_recovery', label: 'Khôi phục tài khoản', duration: '60 phút' },
                    { value: 'change_email', label: 'Thay đổi email', duration: '30 phút' },
                    { value: 'change_phone', label: 'Thay đổi số điện thoại', duration: '10 phút' },
                    { value: 'delete_account', label: 'Xóa tài khoản', duration: '10 phút' }
                ],
                codeTypes: [
                    { value: 'numeric', label: 'Số (0-9)' },
                    { value: 'alphanumeric', label: 'Chữ và số (A-Z, 0-9)' },
                    { value: 'alphabetic', label: 'Chỉ chữ cái (A-Z)' }
                ]
            }
        });
    }

    /**
     * Health check
     * GET /api/otp/health
     */
    async health(req, reply) {
        try {
            // Kiểm tra kết nối database
            const dbStatus = await OTP.db.db.admin().ping();
            
            // Kiểm tra service status
            const serviceStats = {
                rateLimitCacheSize: otpService.rateLimitCache.size,
                cleanupInterval: otpService.cleanupInterval ? 'active' : 'inactive'
            };

            return reply.send({
                success: true,
                message: 'OTP service is healthy',
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
                version: process.env.npm_package_version || '1.0.0',
                database: dbStatus.ok ? 'connected' : 'disconnected',
                service: serviceStats
            });

        } catch (error) {
            req.log.error('OTP health check error:', error);
            return reply.status(503).send({
                success: false,
                message: 'Service unhealthy',
                error: error.message
            });
        }
    }

    /**
     * Lấy lịch sử OTP của user
     * GET /api/otp/history
     */
    async getHistory(req, reply) {
        try {
            if (!req.user) {
                return reply.status(401).send({
                    success: false,
                    message: 'Chưa đăng nhập'
                });
            }

            const {
                page = 1,
                limit = 10,
                type,
                status
            } = req.query;

            // Build filter
            const filter = { userId: req.user.id };
            if (type) filter.type = type;
            if (status) filter.status = status;

            // Calculate pagination
            const skip = (page - 1) * limit;
            
            // Get OTP history
            const [otps, total] = await Promise.all([
                OTP.find(filter)
                    .select('-code -__v')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                OTP.countDocuments(filter)
            ]);

            const pages = Math.ceil(total / limit);

            return reply.send({
                success: true,
                data: {
                    otps,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages
                    }
                }
            });

        } catch (error) {
            req.log.error('OTP history error:', error);
            return reply.status(500).send({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Kiểm tra trạng thái rate limit
     * GET /api/otp/rate-limit/:identifier/:type
     */
    async checkRateLimit(req, reply) {
        try {
            const { identifier, type } = req.params;
            
            const generateKey = `otp_generate_${req.ip}_${identifier}`;
            const verifyKey = `otp_verify_${req.ip}_${identifier}`;
            const resendKey = `otp_resend_${req.ip}_${identifier}`;

            const generateAttempts = otpService.rateLimitCache.get(generateKey) || [];
            const verifyAttempts = otpService.rateLimitCache.get(verifyKey) || [];
            const resendAttempts = otpService.rateLimitCache.get(resendKey) || [];

            return reply.send({
                success: true,
                data: {
                    generate: {
                        attempts: generateAttempts.length,
                        maxAttempts: 5,
                        windowMs: 10 * 60 * 1000, // 10 minutes
                        canAttempt: generateAttempts.length < 5
                    },
                    verify: {
                        attempts: verifyAttempts.length,
                        maxAttempts: 10,
                        windowMs: 5 * 60 * 1000, // 5 minutes
                        canAttempt: verifyAttempts.length < 10
                    },
                    resend: {
                        attempts: resendAttempts.length,
                        maxAttempts: 3,
                        windowMs: 5 * 60 * 1000, // 5 minutes
                        canAttempt: resendAttempts.length < 3
                    }
                }
            });

        } catch (error) {
            req.log.error('OTP rate limit check error:', error);
            return reply.status(500).send({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Test gửi OTP (Development only)
     * POST /api/otp/test-send
     */
    async testSend(req, reply) {
        try {
            // Chỉ cho phép trong môi trường development
            if (process.env.NODE_ENV === 'production') {
                return reply.status(403).send({
                    success: false,
                    message: 'Chức năng này không khả dụng trong production'
                });
            }

            const { identifier, type = 'email_verification' } = req.body;

            const result = await otpService.create({
                identifier,
                type,
                length: 6,
                codeType: 'numeric',
                maxAttempts: 5,
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                extra: { test: true },
                autoSend: true
            });

            // Trong development, trả về code để test
            const otp = await OTP.findById(result.data.id);
            
            return reply.send({
                success: true,
                message: 'Test OTP đã được gửi',
                data: {
                    ...result.data,
                    code: otp.code // Chỉ trong development
                }
            });

        } catch (error) {
            req.log.error('OTP test send error:', error);
            return reply.status(400).send({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Debug OTP (Development only)
     * GET /api/otp/debug/:identifier/:type
     */
    async debug(req, reply) {
        try {
            // Chỉ cho phép trong môi trường development
            if (process.env.NODE_ENV === 'production') {
                return reply.status(403).send({
                    success: false,
                    message: 'Chức năng này không khả dụng trong production'
                });
            }

            const { identifier, type } = req.params;

            // Lấy OTP info
            const otp = await OTP.findOne({
                identifier: identifier.toLowerCase(),
                type,
                status: 'pending'
            }).sort({ createdAt: -1 });

            // Lấy rate limit info (nếu có)
            const rateLimitKey = `otp_generate_${req.ip}_${identifier}`;
            const rateLimitInfo = otpService.rateLimitCache.get(rateLimitKey) || [];

            return reply.send({
                success: true,
                data: {
                    otp: otp ? {
                        id: otp._id,
                        code: otp.code, // Chỉ trong development
                        identifier: otp.identifier,
                        type: otp.type,
                        status: otp.status,
                        attempts: otp.attempts,
                        maxAttempts: otp.maxAttempts,
                        timeRemaining: otp.timeRemaining,
                        isLocked: otp.isLocked,
                        canAttempt: otp.canAttempt,
                        createdAt: otp.createdAt,
                        expiresAt: otp.expiresAt,
                        metadata: otp.metadata
                    } : null,
                    rateLimit: {
                        key: rateLimitKey,
                        attempts: rateLimitInfo.length,
                        lastAttempt: rateLimitInfo.length > 0 ? new Date(rateLimitInfo[rateLimitInfo.length - 1]) : null
                    }
                }
            });

        } catch (error) {
            req.log.error('OTP debug error:', error);
            return reply.status(500).send({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new OTPController();
