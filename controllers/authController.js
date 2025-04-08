const User = require('../models/User');
const Admin = require('../models/Admin');
const Verification = require("../models/Verification");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
require('dotenv').config();
const sendOTP = require("../config/emailService");

exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, mobileNumber, address, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            firstName,
            lastName,
            email,
            mobileNumber,
            address,
            password: hashedPassword,
            role,
        });

        await user.save();
        res.status(200).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        if (!token || !user) {
            res.status(400).json({ message: "Something missing" });
        }

        console.log("User logged successful!");
        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

exports.adminRegister = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new Admin({ name, email, password: hashedPassword });
        await newAdmin.save();

        const token = jwt.sign({ id: newAdmin._id }, 'your_jwt_secret', { expiresIn: '1h' });

        res.status(200).json({
            message: 'Admin created successfully',
            admin: {
                name: newAdmin.name,
                email: newAdmin.email
            },
            token
        });

    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Data is missing" });
        }

        const admin = await Admin.findOne({ email });

        if (!admin) return res.status(400).json({ message: "Admin not found" });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const adminToken = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        if (!adminToken || !admin) {
            res.status(400).json({ message: "Something missing" });
        }

        console.log("Admin logged successful!");
        res.json({ adminToken, admin });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists!" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOTP = await bcrypt.hash(otp, 10);
        const token = crypto.randomBytes(20).toString("hex");
        const otpExpiry = Date.now() + 10 * 60 * 1000;

        let verification = await Verification.findOne({ email });
        if (verification) {
            verification.otp = hashedOTP;
            verification.otpExpiry = otpExpiry;
        } else {
            verification = new Verification({ email, otp: hashedOTP, otpExpiry, token });
        }

        await verification.save();
        const verificationLink = `http://localhost:3009/verification?token=${token}&email=${email}`;
        await sendOTP(email, otp, verificationLink);

        res.json({ message: "OTP sent to email" });
    } catch (error) {
        res.status(500).json({ error: "Error sending OTP" });
    }
};

exports.checkToken = async (req, res) => {
    try {
        const { email, token } = req.body;

        // Assuming Verification is a model (e.g., Mongoose model) for checking user
        const user = await Verification.findOne({ email, token });

        if (!user) {
            return res.status(400).json({ error: "User Validation Failed" });
        }

        // Return success status with 'success' flag
        res.status(200).json({ success: 200 });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ error: "Error verifying OTP" });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, token, otp } = req.body;

        const verification = await Verification.findOne({ email, token });
        if (!verification) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }

        if (verification.otpExpiry < Date.now()) {
            await Verification.deleteOne({ email });
            return res.status(400).json({ error: "OTP expired. Request a new OTP." });
        }

        const isMatch = await bcrypt.compare(otp, verification.otp);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid OTP" });
        }

        await Verification.deleteOne({ email });
        res.json({ success: true, message: "OTP Verified. You can now complete your registration." });

    } catch (error) {
        res.status(500).json({ error: "Error verifying OTP" });
    }
};

exports.setPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !user.isVerified) {
            return res.status(400).json({ error: "User not verified" });
        }

        user.password = await bcrypt.hash(password, 10);
        await user.save();

        res.json({ message: "Password set successfully. You can log in now" });
    } catch (error) {
        res.status(500).json({ error: "Error setting password" });
    }
};

exports.forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ message: "Email is not valid. Please contact admin" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOTP = await bcrypt.hash(otp, 10);
        const token = crypto.randomBytes(20).toString("hex");
        const otpExpiry = Date.now() + 10 * 60 * 1000;

        let verification = await Verification.findOne({ email });
        if (verification) {
            verification.otp = hashedOTP;
            verification.otpExpiry = otpExpiry;
            verification.token = token;
        } else {
            verification = new Verification({ email, otp: hashedOTP, otpExpiry, token });
        }

        await verification.save();
        const verificationLink = `http://localhost:3009/passwordOtp?token=${token}&email=${email}`;
        await sendOTP(email, otp, verificationLink);

        res.json({ message: "OTP sent to email" });
    } catch (error) {
        res.status(500).json({ error: "Error sending OTP" });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match!' });
        }

        if (!newPassword) {
            return res.status(400).json({ message: 'New password is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        await user.save();

        res.status(200).json({ message: 'Password changed successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error changing password' });
    }
};

exports.createNewPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userID = req.user.id;

        const user = await User.findById(userID);

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating password', error: error.message });
    }
};