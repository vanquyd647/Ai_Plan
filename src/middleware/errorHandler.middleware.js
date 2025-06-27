// ==== src/middleware/errorHandler.middleware.js ====
module.exports = (error, req, reply) => {
    req.log.error({ err: error }, 'Unhandled error');
    reply.status(500).send({ error: 'Internal Server Error' });
};
