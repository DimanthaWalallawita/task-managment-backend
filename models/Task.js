const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    taskName: { type: String, required: true },
    description: { type: String, maxlength: 1250 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isCompleted: { type: Boolean, default: false },
    completionDate: { type: Date },
    isEnabled: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
