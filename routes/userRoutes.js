const express = require('express');
const { getUsers, updateUser, deleteUser, toggleUserStatus, getAdmins, deleteAdmin, updateAdmin, userDetails, userProfileUpdate, adminDetails } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router();

router.get('/getUsers', getUsers);
router.patch('/update/:userId', updateUser);
router.delete('/delete/:userId', deleteUser);
router.patch('/switch/:userId', toggleUserStatus);
router.get('/admins', getAdmins);
router.delete('/admin/delete/:adminId', deleteAdmin);
router.patch('/admin/update/:adminId', updateAdmin);
router.get('/user', authMiddleware, userDetails);
router.patch('/user/profile', authMiddleware, userProfileUpdate);
router.get('/admin/data', authMiddleware, adminDetails);

module.exports = router;