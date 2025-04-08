const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobileNumber: { type: String, required: true },
    address: { type: String },
    role: { type: String, enum: ['Admin', 'User'], default: 'User' },
    password: { type: String, required: true },
    isEnabled: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);