const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { 
    JWT_SECRET, 
    JWT_EXPIRES_IN, 
    JWT_REFRESH_SECRET, 
    JWT_REFRESH_EXPIRES_IN,
    JWT_ISSUER,
    JWT_AUDIENCE 
} = require('../config/environment');

// Validate JWT configuration
if (!JWT_SECRET || JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
}

if (!JWT_REFRESH_SECRET || JWT_REFRESH_SECRET.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
}

// Token blacklist (trong production nên dùng Redis)
const tokenBlacklist = new Set();

// ✅ Enhanced Access Token generation
exports.generateAccessToken = (payload) => {
    try {
        // Add security claims
        const enhancedPayload = {
            ...payload,
            iss: JWT_ISSUER || 'your-app-name',
            aud: JWT_AUDIENCE || 'your-app-users',
            iat: Math.floor(Date.now() / 1000),
            nbf: Math.floor(Date.now() / 1000), // Not before
            jti: crypto.randomUUID(), // JWT ID for tracking
            type: 'access'
        };

        return jwt.sign(enhancedPayload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN || '15m',
            algorithm: 'HS256'
        });
    } catch (error) {
        console.error('Error generating access token:', error.message);
        throw new Error('Token generation failed');
    }
};

// ✅ Enhanced Refresh Token generation
exports.generateRefreshToken = (payload) => {
    try {
        const enhancedPayload = {
            ...payload,
            iss: JWT_ISSUER || 'your-app-name',
            aud: JWT_AUDIENCE || 'your-app-users',
            iat: Math.floor(Date.now() / 1000),
            nbf: Math.floor(Date.now() / 1000),
            jti: crypto.randomUUID(),
            type: 'refresh'
        };

        return jwt.sign(enhancedPayload, JWT_REFRESH_SECRET, {
            expiresIn: JWT_REFRESH_EXPIRES_IN || '7d',
            algorithm: 'HS256'
        });
    } catch (error) {
        console.error('Error generating refresh token:', error.message);
        throw new Error('Refresh token generation failed');
    }
};

// ✅ Verify Access Token
exports.verifyAccessToken = (token) => {
    try {
        if (!token) {
            throw new Error('Token is required');
        }

        // Check if token is blacklisted
        if (tokenBlacklist.has(token)) {
            throw new Error('Token has been revoked');
        }

        const decoded = jwt.verify(token, JWT_SECRET, {
            algorithms: ['HS256'],
            issuer: JWT_ISSUER || 'your-app-name',
            audience: JWT_AUDIENCE || 'your-app-users'
        });

        // Verify token type
        if (decoded.type !== 'access') {
            throw new Error('Invalid token type');
        }

        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Access token has expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid access token');
        } else if (error.name === 'NotBeforeError') {
            throw new Error('Token not active yet');
        }
        
        throw error;
    }
};

// ✅ Verify Refresh Token
exports.verifyRefreshToken = (token) => {
    try {
        if (!token) {
            throw new Error('Refresh token is required');
        }

        // Check if token is blacklisted
        if (tokenBlacklist.has(token)) {
            throw new Error('Refresh token has been revoked');
        }

        const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
            algorithms: ['HS256'],
            issuer: JWT_ISSUER || 'your-app-name',
            audience: JWT_AUDIENCE || 'your-app-users'
        });

        // Verify token type
        if (decoded.type !== 'refresh') {
            throw new Error('Invalid token type');
        }

        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Refresh token has expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid refresh token');
        } else if (error.name === 'NotBeforeError') {
            throw new Error('Token not active yet');
        }
        
        throw error;
    }
};

// ✅ Decode token without verification (for debugging)
exports.decodeToken = (token) => {
    try {
        return jwt.decode(token, { complete: true });
    } catch (error) {
        console.error('Error decoding token:', error.message);
        return null;
    }
};

// ✅ Get token expiration time
exports.getTokenExpiration = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.exp) {
            return new Date(decoded.exp * 1000);
        }
        return null;
    } catch (error) {
        console.error('Error getting token expiration:', error.message);
        return null;
    }
};

// ✅ Check if token is expired
exports.isTokenExpired = (token) => {
    try {
        const expiration = this.getTokenExpiration(token);
        if (!expiration) return true;
        
        return expiration < new Date();
    } catch (error) {
        return true;
    }
};

// ✅ Revoke token (add to blacklist)
exports.revokeToken = (token) => {
    try {
        if (token) {
            tokenBlacklist.add(token);
            console.log(`Token revoked: ${token.substring(0, 20)}...`);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error revoking token:', error.message);
        return false;
    }
};

// ✅ Check if token is revoked
exports.isTokenRevoked = (token) => {
    return tokenBlacklist.has(token);
};

// ✅ Clear expired tokens from blacklist (cleanup function)
exports.cleanupBlacklist = () => {
    try {
        let cleanedCount = 0;
        const now = Date.now();
        
        for (const token of tokenBlacklist) {
            const expiration = this.getTokenExpiration(token);
            if (expiration && expiration.getTime() < now) {
                tokenBlacklist.delete(token);
                cleanedCount++;
            }
        }
        
        console.log(`Cleaned up ${cleanedCount} expired tokens from blacklist`);
        return cleanedCount;
    } catch (error) {
        console.error('Error cleaning up blacklist:', error.message);
        return 0;
    }
};

// ✅ Get blacklist size
exports.getBlacklistSize = () => {
    return tokenBlacklist.size;
};

// ✅ Generate secure random token (for other purposes)
exports.generateSecureToken = (length = 32) => {
    try {
        return crypto.randomBytes(length).toString('hex');
    } catch (error) {
        console.error('Error generating secure token:', error.message);
        throw new Error('Secure token generation failed');
    }
};

// ✅ Generate token pair (access + refresh)
exports.generateTokenPair = (payload) => {
    try {
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken({
            userId: payload.userId
        });

        return {
            accessToken,
            refreshToken,
            expiresIn: JWT_EXPIRES_IN || '15m',
            tokenType: 'Bearer'
        };
    } catch (error) {
        console.error('Error generating token pair:', error.message);
        throw new Error('Token pair generation failed');
    }
};

// ✅ Extract token from Authorization header
exports.extractTokenFromHeader = (authHeader) => {
    if (!authHeader) {
        return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }

    return parts[1];
};

// ✅ Validate token format
exports.isValidTokenFormat = (token) => {
    if (!token || typeof token !== 'string') {
        return false;
    }

    // JWT should have 3 parts separated by dots
    const parts = token.split('.');
    return parts.length === 3;
};

// ✅ Get token info (without verification)
exports.getTokenInfo = (token) => {
    try {
        if (!this.isValidTokenFormat(token)) {
            return null;
        }

        const decoded = jwt.decode(token);
        if (!decoded) {
            return null;
        }

        return {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            type: decoded.type,
            issuedAt: decoded.iat ? new Date(decoded.iat * 1000) : null,
            expiresAt: decoded.exp ? new Date(decoded.exp * 1000) : null,
            issuer: decoded.iss,
            audience: decoded.aud,
            jwtId: decoded.jti,
            isExpired: this.isTokenExpired(token),
            isRevoked: this.isTokenRevoked(token)
        };
    } catch (error) {
        console.error('Error getting token info:', error.message);
        return null;
    }
};

// ✅ Generate email verification token
exports.generateEmailVerificationToken = (email, userId) => {
    try {
        const payload = {
            email,
            userId,
            type: 'email_verification',
            purpose: 'verify_email'
        };

        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: '24h',
            issuer: JWT_ISSUER || 'your-app-name',
            audience: JWT_AUDIENCE || 'your-app-users'
        });
    } catch (error) {
        console.error('Error generating email verification token:', error.message);
        throw new Error('Email verification token generation failed');
    }
};

// ✅ Generate password reset token
exports.generatePasswordResetToken = (email, userId) => {
    try {
        const payload = {
            email,
            userId,
            type: 'password_reset',
            purpose: 'reset_password'
        };

        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: '1h',
            issuer: JWT_ISSUER || 'your-app-name',
            audience: JWT_AUDIENCE || 'your-app-users'
        });
    } catch (error) {
        console.error('Error generating password reset token:', error.message);
        throw new Error('Password reset token generation failed');
    }
};

// ✅ Verify special purpose tokens
exports.verifySpecialToken = (token, expectedType) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            algorithms: ['HS256'],
            issuer: JWT_ISSUER || 'your-app-name',
            audience: JWT_AUDIENCE || 'your-app-users'
        });

        if (decoded.type !== expectedType) {
            throw new Error(`Expected token type ${expectedType}, got ${decoded.type}`);
        }

        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token has expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        }
        
        throw error;
    }
};

module.exports = {
    generateAccessToken: exports.generateAccessToken,
    generateRefreshToken: exports.generateRefreshToken,
    verifyAccessToken: exports.verifyAccessToken,
    verifyRefreshToken: exports.verifyRefreshToken,
    decodeToken: exports.decodeToken,
    getTokenExpiration: exports.getTokenExpiration,
    isTokenExpired: exports.isTokenExpired,
    revokeToken: exports.revokeToken,
    isTokenRevoked: exports.isTokenRevoked,
    cleanupBlacklist: exports.cleanupBlacklist,
    getBlacklistSize: exports.getBlacklistSize,
    generateSecureToken: exports.generateSecureToken,
    generateTokenPair: exports.generateTokenPair,
    extractTokenFromHeader: exports.extractTokenFromHeader,
    isValidTokenFormat: exports.isValidTokenFormat,
    getTokenInfo: exports.getTokenInfo,
    generateEmailVerificationToken: exports.generateEmailVerificationToken,
    generatePasswordResetToken: exports.generatePasswordResetToken,
    verifySpecialToken: exports.verifySpecialToken
};
