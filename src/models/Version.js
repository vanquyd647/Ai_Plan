const mongoose = require('mongoose');

const VersionSchema = new mongoose.Schema({
    document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    blocksSnapshot: [{ type: mongoose.Schema.Types.Mixed }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Version', VersionSchema);
