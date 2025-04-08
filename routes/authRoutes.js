const express = require('express');
const { register, login, sendOTP, verifyOTP, checkToken ,setPassword, adminRegister, adminLogin, forgetPassword, changePassword, createNewPassword } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/set-password", setPassword);
router.post("/checkToken", checkToken);
router.post("/create", adminRegister);
router.post('/admin/login', adminLogin);
router.post('/forget-password', forgetPassword);
router.post('/changePassword', changePassword);
router.patch('/resetPassword', authMiddleware, createNewPassword);

module.exports = router;
