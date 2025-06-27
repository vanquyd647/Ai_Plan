const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    title: { type: String, required: true },
    status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
    dueDate: Date,
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
