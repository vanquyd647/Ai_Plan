// src/plugins/mongodb.plugin.js
const mongoose = require('mongoose');
const fp = require('fastify-plugin');
const { mongoUri } = require('../config/database');

async function mongodb(fastify, opts) {
    await mongoose.connect(mongoUri);
    fastify.decorate('mongoose', mongoose);
}

module.exports = fp(mongodb);
