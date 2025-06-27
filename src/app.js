const fastify = require('fastify');
const loggerConfig = require('./config/logger');
const geminiService = require('./utils/gemini'); // Import service Gemini
const fastifyFormbody = require('@fastify/formbody'); // Import plugin formbody

const app = fastify({ logger: loggerConfig });

// Đăng ký plugin formbody
app.register(fastifyFormbody);

// Plugins khác
app.register(require('./plugins/mongodb.plugin'));
app.register(require('./plugins/redis.plugin'));
app.register(require('./plugins/cors.plugin'));
app.register(require('./plugins/websocket.plugin'));
app.register(require('./plugins/logger.plugin'));

// Middleware
app.addHook('onRequest', require('./middleware/auth.middleware'));
app.setErrorHandler(require('./middleware/errorHandler.middleware'));

// Route sử dụng GeminiService
app.post('/api/gemini', async (request, reply) => {
    console.log('Request Body:', request.body); // Log body để kiểm tra dữ liệu

    const { prompt } = request.body;

    if (!prompt) {
        return reply.code(400).send({ error: 'Prompt is required' });
    }

    try {
        const response = await geminiService.generateResponse(prompt);
        reply.send({ response });
    } catch (error) {
        app.log.error(error);
        reply.code(500).send({ error: 'Failed to generate response from Gemini AI' });
    }
});

// Routes khác
app.register(require('./api/index.routes'), { prefix: '/api' }); 

module.exports = app;
