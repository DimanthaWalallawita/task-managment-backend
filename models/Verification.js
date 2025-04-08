const mongoose = require("mongoose");

const VerificationSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    otpExpiry: { type: Date, required: true },
    token: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("Verification", VerificationSchema);
