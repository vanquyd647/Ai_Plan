const path = require('path');
const { isProd } = require('./environment');

module.exports = isProd
    ? {
        level: 'info',
        file: path.join(__dirname, '../logs/app.log'),
    }
    : {
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
                colorize: true,
            },
        },
    };
