'use strict';
const jwt = require('../../utils/jwt');
const User = require('../../models/User');

async function googleAuthRoutes(fastify, options) {
    try {
        // ✅ Kiểm tra config trước
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
            fastify.log.warn('Google OAuth not configured - skipping Google routes');
            
            // Route thông báo chưa config
            fastify.get('/config', async (req, reply) => {
                return {
                    configured: false,
                    message: 'Google OAuth chưa được cấu hình',
                    required: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']
                };
            });
            
            fastify.get('/', async (req, reply) => {
                return reply.status(503).send({
                    success: false,
                    message: 'Google OAuth chưa được cấu hình'
                });
            });
            
            return;
        }

        // ✅ Import passport sau khi kiểm tra config
        const passport = require('passport');
        const GoogleStrategy = require('passport-google-oauth20').Strategy;

        // ✅ Đăng ký session plugin
        await fastify.register(require('@fastify/session'), {
            secret: process.env.COOKIE_SECRET || 'your-secret-key-here-change-in-production',
            cookie: {
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                sameSite: process.env.COOKIE_SAME_SITE || 'lax',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            }
        });

        // ✅ Đăng ký passport plugin - CÁCH ĐÚNG
        await fastify.register(async function (fastify) {
            // Khởi tạo passport strategy
            passport.use('google', new GoogleStrategy({
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback"
            }, async (accessToken, refreshToken, profile, done) => {
                try {
                    fastify.log.info(`Google authentication for: ${profile.emails[0].value}`);
                    
                    // Tìm user theo Google ID hoặc email
                    let user = await User.findOne({ 
                        $or: [
                            { googleId: profile.id },
                            { email: profile.emails[0].value }
                        ]
                    });

                    if (user) {
                        // Cập nhật Google ID nếu chưa có
                        if (!user.googleId) {
                            user.googleId = profile.id;
                            await user.save();
                            fastify.log.info(`Updated Google ID for user: ${user.email}`);
                        }
                        return done(null, user);
                    } else {
                        // Tạo user mới
                        user = new User({
                            googleId: profile.id,
                            name: profile.displayName,
                            email: profile.emails[0].value,
                            avatar: profile.photos[0]?.value,
                            isEmailVerified: true,
                            provider: 'google'
                        });
                        
                        await user.save();
                        fastify.log.info(`Created new user from Google: ${user.email}`);
                        return done(null, user);
                    }
                } catch (error) {
                    fastify.log.error('Google strategy error:', error);
                    return done(error, null);
                }
            }));

            // Serialize user cho session
            passport.serializeUser((user, done) => {
                done(null, user._id);
            });

            passport.deserializeUser(async (id, done) => {
                try {
                    const user = await User.findById(id);
                    done(null, user);
                } catch (error) {
                    done(error, null);
                }
            });

            // Initialize passport
            fastify.addHook('preHandler', async (request, reply) => {
                if (!request.session.passport) {
                    request.session.passport = {};
                }
            });
        });

        // ✅ Route để test config
        fastify.get('/config', async (req, reply) => {
            return {
                configured: true,
                clientId: 'Configured ✅',
                callbackUrl: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback",
                message: 'Google OAuth đã được cấu hình'
            };
        });

        // ✅ Route khởi tạo Google OAuth login
        fastify.get('/', async (req, reply) => {
            try {
                const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
                    `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
                    `redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback")}&` +
                    `response_type=code&` +
                    `scope=${encodeURIComponent('profile email')}&` +
                    `access_type=offline&` +
                    `prompt=consent`;

                return reply.redirect(authUrl);
            } catch (error) {
                fastify.log.error('Google auth initiation error:', error);
                return reply.status(500).send({
                    success: false,
                    message: 'Lỗi khởi tạo Google authentication'
                });
            }
        });

        // ✅ Callback URL - xử lý thủ công
        fastify.get('/callback', async (req, reply) => {
            try {
                const { code, error } = req.query;

                if (error) {
                    fastify.log.error('Google OAuth error:', error);
                    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
                    return reply.redirect(`${frontendUrl}/login?error=google-auth-failed&message=${encodeURIComponent(error)}`);
                }

                if (!code) {
                    throw new Error('No authorization code received');
                }

                // Exchange code for token
                const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        client_id: process.env.GOOGLE_CLIENT_ID,
                        client_secret: process.env.GOOGLE_CLIENT_SECRET,
                        code: code,
                        grant_type: 'authorization_code',
                        redirect_uri: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback"
                    })
                });

                const tokenData = await tokenResponse.json();

                if (!tokenResponse.ok) {
                    throw new Error(`Token exchange failed: ${tokenData.error_description || tokenData.error}`);
                }

                // Get user profile
                const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                    headers: {
                        'Authorization': `Bearer ${tokenData.access_token}`
                    }
                });

                const profile = await profileResponse.json();

                if (!profileResponse.ok) {
                    throw new Error('Failed to get user profile');
                }

                // Tìm hoặc tạo user
                let user = await User.findOne({ 
                    $or: [
                        { googleId: profile.id },
                        { email: profile.email }
                    ]
                });

                if (user) {
                    // Cập nhật Google ID nếu chưa có
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        await user.save();
                    }
                } else {
                    // Tạo user mới
                    user = new User({
                        googleId: profile.id,
                        name: profile.name,
                        email: profile.email,
                        avatar: profile.picture,
                        isEmailVerified: true,
                        provider: 'google'
                    });
                    
                    await user.save();
                }

                // Tạo JWT token
                const tokenPair = jwt.generateTokenPair({
                    userId: user._id,
                    email: user.email,
                    role: user.role || 'user'
                });

                // Lưu refresh token (nếu method tồn tại)
                if (user.addRefreshToken) {
                    const refreshTokenExpiry = new Date();
                    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

                    await user.addRefreshToken(
                        tokenPair.refreshToken,
                        refreshTokenExpiry,
                        req.headers['user-agent'],
                        req.ip,
                        'google'
                    );
                }

                // Ghi nhận đăng nhập thành công (nếu method tồn tại)
                if (user.recordLogin) {
                    await user.recordLogin(
                        req.ip,
                        req.headers['user-agent'],
                        'google',
                        true
                    );
                }

                // Set cookie refresh token
                reply.setCookie('refreshToken', tokenPair.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.COOKIE_SAME_SITE || 'lax',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                    path: '/'
                });

                // Redirect về frontend với access token
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
                const redirectUrl = `${frontendUrl}/auth/success?accessToken=${tokenPair.accessToken}&expiresIn=${tokenPair.expiresIn}`;

                fastify.log.info(`Google authentication successful for: ${user.email}`);
                return reply.redirect(redirectUrl);

            } catch (error) {
                fastify.log.error('Google callback error:', error);
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
                return reply.redirect(`${frontendUrl}/login?error=google-auth-failed&message=${encodeURIComponent(error.message)}`);
            }
        });

        // ✅ Test route
        fastify.get('/test', async (req, reply) => {
            return {
                success: true,
                message: 'Google routes loaded successfully',
                timestamp: new Date().toISOString()
            };
        });

    } catch (error) {
        fastify.log.error('Error setting up Google routes:', error);
        throw error;
    }
}

// ✅ Export function
module.exports = googleAuthRoutes;
