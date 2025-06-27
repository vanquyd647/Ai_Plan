const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    title: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);
