const nodemailer = require("nodemailer");
require('dotenv').config();

const transporter = nodemailer.createTransport(
    {
        secure: true,
        host: 'smtp.gmail.com',
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    }
);

const sendOTP = async (email, otp, verificationLink) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Email Verification - OTP Code",
        html: `
            <h2>Email Verification</h2>
            <p>Your OTP code is: <strong>${otp}</strong></p>
            <p>Click the link below to verify your email:</p>
            <a href="${verificationLink}">${verificationLink}</a>
            <p>This OTP will expire in 10 minutes.</p>
        `,
    };
    await transporter.sendMail(mailOptions);
};

module.exports = sendOTP;