const fastify = require('fastify');
const loggerConfig = require('./config/logger');
const geminiService = require('./utils/gemini');
const fastifyFormbody = require('@fastify/formbody');

const app = fastify({ logger: loggerConfig });

// 🔒 SECURITY PLUGINS
app.register(require('@fastify/helmet'), {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
});

// Rate limiting plugin
app.register(require('@fastify/rate-limit'), {
    global: false // Sẽ config riêng cho từng route
});

// CORS với config an toàn
app.register(require('@fastify/cors'), {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
});

// Cookie support cho refresh token
app.register(require('@fastify/cookie'), {
    secret: process.env.COOKIE_SECRET || 'your-cookie-secret-key',
    parseOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }
});

// Đăng ký plugin formbody với giới hạn kích thước
app.register(fastifyFormbody, {
    bodyLimit: 1048576 // 1MB limit
});

// Plugins khác
app.register(require('./plugins/mongodb.plugin'));
app.register(require('./plugins/redis.plugin'));
app.register(require('./plugins/websocket.plugin'));
app.register(require('./plugins/logger.plugin'));

// Security middleware
app.addHook('onRequest', async (request, reply) => {
    // Remove sensitive headers
    reply.removeHeader('x-powered-by');
    
    // Add security headers
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Log suspicious requests
    if (request.headers['user-agent']?.includes('bot') && 
        !request.url.includes('/health')) {
        request.log.warn(`Suspicious request from ${request.ip}: ${request.headers['user-agent']}`);
    }
});

// Enhanced error handler
app.setErrorHandler(require('./middleware/errorHandler.middleware'));

// Health check endpoint
app.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});

// Route sử dụng GeminiService - CẦN AUTH
const { authenticate } = require('./middleware/auth.middleware');
app.post('/api/gemini', {
    preHandler: [authenticate],
    config: {
        rateLimit: {
            max: 10,
            timeWindow: '1 minute'
        }
    }
}, async (request, reply) => {
    try {
        const { prompt } = request.body;
        
        if (!prompt || prompt.trim().length === 0) {
            return reply.code(400).send({
                success: false,
                message: 'Prompt is required'
            });
        }
        
        // Input sanitization
        const sanitizedPrompt = prompt.trim().substring(0, 1000); // Limit length
        
        const response = await geminiService.generateContent(sanitizedPrompt);
        
        // Log API usage
        request.log.info(`Gemini API used by user ${request.user.id}`);
        
        return reply.send({
            success: true,
            data: response
        });
    } catch (error) {
        request.log.error(`Gemini API error: ${error.message}`);
        return reply.code(500).send({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Routes
app.register(require('./api/auth/auth.routes'), { prefix: '/api/auth' });

module.exports = app;
