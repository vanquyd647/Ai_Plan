const mongoose = require('mongoose');

const AIInteractionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    prompt: { type: String, required: true },
    response: String,
    modelUsed: String,
}, { timestamps: true });

module.exports = mongoose.model('AIInteraction', AIInteractionSchema);
