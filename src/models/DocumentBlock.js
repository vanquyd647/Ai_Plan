const mongoose = require('mongoose');

const DocumentBlockSchema = new mongoose.Schema({
    document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    type: { type: String, enum: ['text', 'code', 'image'], required: true },
    content: String,
    position: Number,
}, { timestamps: true });

module.exports = mongoose.model('DocumentBlock', DocumentBlockSchema);
