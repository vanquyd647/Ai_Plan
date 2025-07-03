'use strict';

const mongoose = require('mongoose');

/**
 * OTP Model Schema
 * Quản lý mã OTP với các loại khác nhau và tự động hết hạn
 */
const otpSchema = new mongoose.Schema({
    // Mã OTP
    code: {
        type: String,
        required: [true, 'Mã OTP là bắt buộc'],
        index: true,
        minlength: [4, 'Mã OTP phải có ít nhất 4 ký tự'],
        maxlength: [8, 'Mã OTP không được quá 8 ký tự']
    },
    
    // Định danh người dùng (email/phone)
    identifier: {
        type: String,
        required: [true, 'Định danh người dùng là bắt buộc'],
        index: true,
        lowercase: true,
        trim: true
    },
    
    // Loại OTP
    type: {
        type: String,
        required: [true, 'Loại OTP là bắt buộc'],
        enum: {
            values: [
                'email_verification',    // Xác thực email
                'phone_verification',    // Xác thực số điện thoại
                'password_reset',        // Đặt lại mật khẩu
                'login_2fa',            // Xác thực 2 bước
                'transaction',          // Xác thực giao dịch
                'account_recovery',     // Khôi phục tài khoản
                'change_email',         // Thay đổi email
                'change_phone',         // Thay đổi số điện thoại
                'delete_account',       // Xóa tài khoản
                'withdrawal'            // Rút tiền
            ],
            message: 'Loại OTP không hợp lệ'
        },
        index: true
    },
    
    // Trạng thái OTP
    status: {
        type: String,
        enum: {
            values: ['pending', 'verified', 'expired', 'failed', 'cancelled'],
            message: 'Trạng thái OTP không hợp lệ'
        },
        default: 'pending',
        index: true
    },
    
    // Thời gian hết hạn (MongoDB TTL)
    expiresAt: {
        type: Date,
        required: [true, 'Thời gian hết hạn là bắt buộc'],
        index: { expireAfterSeconds: 0 }
    },
    
    // Số lần thử sai
    attempts: {
        type: Number,
        default: 0,
        min: [0, 'Số lần thử không được âm'],
        max: [10, 'Số lần thử không được quá 10']
    },
    
    // Số lần thử tối đa
    maxAttempts: {
        type: Number,
        default: 5,
        min: [1, 'Số lần thử tối đa phải ít nhất 1'],
        max: [10, 'Số lần thử tối đa không được quá 10']
    },
    
    // Thời gian khóa
    lockedUntil: {
        type: Date,
        default: null
    },
    
    // User ID (nếu có)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    
    // Metadata
    metadata: {
        // IP tạo OTP
        createdIP: {
            type: String,
            default: null
        },
        
        // User Agent
        userAgent: {
            type: String,
            default: null
        },
        
        // Thông tin bổ sung
        extra: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        
        // Phương thức gửi
        deliveryMethod: {
            type: String,
            enum: ['email', 'sms', 'voice', 'app'],
            default: 'email'
        },
        
        // Trạng thái gửi
        deliveryStatus: {
            type: String,
            enum: ['pending', 'sent', 'failed', 'bounced'],
            default: 'pending'
        },
        
        // Thời gian gửi
        sentAt: {
            type: Date,
            default: null
        },
        
        // Lỗi gửi (nếu có)
        deliveryError: {
            type: String,
            default: null
        }
    },
    
    // Thời gian xác thực thành công
    verifiedAt: {
        type: Date,
        default: null
    },
    
    // Thời gian hủy
    cancelledAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    collection: 'otps',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound Indexes
otpSchema.index({ identifier: 1, type: 1, status: 1 });
otpSchema.index({ code: 1, identifier: 1, type: 1 });
otpSchema.index({ userId: 1, type: 1, status: 1 });
otpSchema.index({ createdAt: -1 });
otpSchema.index({ expiresAt: 1 });

// Virtual Properties
otpSchema.virtual('isExpired').get(function() {
    return this.expiresAt < new Date();
});

otpSchema.virtual('isLocked').get(function() {
    return this.lockedUntil && this.lockedUntil > new Date();
});

otpSchema.virtual('timeRemaining').get(function() {
    const remaining = Math.max(0, Math.floor((this.expiresAt - new Date()) / 1000));
    return remaining;
});

otpSchema.virtual('canAttempt').get(function() {
    return !this.isLocked && !this.isExpired && this.attempts < this.maxAttempts && this.status === 'pending';
});

// Instance Methods
otpSchema.methods.verify = function(inputCode) {
    // Kiểm tra điều kiện
    if (this.isLocked) {
        throw new Error('OTP đã bị khóa do thử sai quá nhiều lần');
    }
    
    if (this.isExpired) {
        this.status = 'expired';
        throw new Error('OTP đã hết hạn');
    }
    
    if (this.status !== 'pending') {
        throw new Error('OTP không ở trạng thái chờ xác thực');
    }
    
    // Tăng số lần thử
    this.attempts += 1;
    
    // Kiểm tra mã
    if (this.code !== inputCode.toString()) {
        // Khóa nếu thử sai quá nhiều
        if (this.attempts >= this.maxAttempts) {
            this.status = 'failed';
            this.lockedUntil = new Date(Date.now() + this.getLockDuration());
        }
        return false;
    }
    
    // Xác thực thành công
    this.status = 'verified';
    this.verifiedAt = new Date();
    return true;
};

otpSchema.methods.cancel = function(reason = null) {
    this.status = 'cancelled';
    this.cancelledAt = new Date();
    if (reason) {
        this.metadata.extra.cancelReason = reason;
    }
};

otpSchema.methods.markAsSent = function(method = 'email') {
    this.metadata.deliveryMethod = method;
    this.metadata.deliveryStatus = 'sent';
    this.metadata.sentAt = new Date();
};

otpSchema.methods.markAsDeliveryFailed = function(error) {
    this.metadata.deliveryStatus = 'failed';
    this.metadata.deliveryError = error;
};

otpSchema.methods.getLockDuration = function() {
    // Thời gian khóa tăng dần theo loại OTP
    const lockDurations = {
        'login_2fa': 5 * 60 * 1000,        // 5 phút
        'transaction': 15 * 60 * 1000,     // 15 phút
        'withdrawal': 30 * 60 * 1000,      // 30 phút
        'password_reset': 10 * 60 * 1000,  // 10 phút
        'delete_account': 60 * 60 * 1000   // 60 phút
    };
    
    return lockDurations[this.type] || 10 * 60 * 1000; // Default 10 phút
};

// Static Methods
otpSchema.statics.generateCode = function(length = 6, type = 'numeric') {
    let characters;
    
    switch (type) {
        case 'numeric':
            characters = '0123456789';
            break;
        case 'alphanumeric':
            characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            break;
        case 'alphabetic':
            characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            break;
        default:
            characters = '0123456789';
    }
    
    let code = '';
    for (let i = 0; i < length; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return code;
};

otpSchema.statics.getExpiryDuration = function(type) {
    const durations = {
        'email_verification': 30 * 60 * 1000,    // 30 phút
        'phone_verification': 10 * 60 * 1000,    // 10 phút
        'password_reset': 15 * 60 * 1000,        // 15 phút
        'login_2fa': 5 * 60 * 1000,              // 5 phút
        'transaction': 3 * 60 * 1000,            // 3 phút
        'withdrawal': 5 * 60 * 1000,             // 5 phút
        'account_recovery': 60 * 60 * 1000,      // 60 phút
        'change_email': 30 * 60 * 1000,          // 30 phút
        'change_phone': 10 * 60 * 1000,          // 10 phút
        'delete_account': 10 * 60 * 1000         // 10 phút
    };
    
    return durations[type] || 10 * 60 * 1000; // Default 10 phút
};

otpSchema.statics.findActiveOTP = function(identifier, type) {
    return this.findOne({
        identifier: identifier.toLowerCase(),
        type,
        status: 'pending',
        expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
};

otpSchema.statics.invalidateExisting = function(identifier, type) {
    return this.updateMany(
        {
            identifier: identifier.toLowerCase(),
            type,
            status: 'pending'
        },
        {
            status: 'cancelled',
            cancelledAt: new Date()
        }
    );
};

otpSchema.statics.cleanupExpired = function() {
    return this.deleteMany({
        $or: [
            { expiresAt: { $lt: new Date() } },
            { status: { $in: ['verified', 'expired', 'failed', 'cancelled'] } }
        ]
    });
};

// Pre-save middleware
otpSchema.pre('save', function(next) {
    // Đảm bảo identifier là lowercase
    if (this.identifier) {
        this.identifier = this.identifier.toLowerCase();
    }
    
    // Set expiresAt nếu chưa có
    if (this.isNew && !this.expiresAt) {
        const duration = this.constructor.getExpiryDuration(this.type);
        this.expiresAt = new Date(Date.now() + duration);
    }
    
    next();
});

// Post-save middleware
otpSchema.post('save', function(doc) {
    // Log OTP creation/update
    console.log(`OTP ${doc.isNew ? 'created' : 'updated'}: ${doc.type} for ${doc.identifier}`);
});

module.exports = mongoose.model('OTP', otpSchema);
