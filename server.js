require('dotenv').config();
const app = require('./src/app');
const { port } = require('./src/config/environment');

const start = async () => {
    try {
        await app.listen({ port });
        console.log(`🚀 Server running on port ${port}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
