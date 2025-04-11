require('dotenv').config();
const User = require('../models/User');
const Admin = require('../models/Admin');

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: "Error fetching users" });
    }
};

exports.updateUser = async (req, res) => {
    const { firstName, lastName, email, mobileNumber, address, role, isEnabled } = req.body;
    const userId = req.params.userId;

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, {
            firstName,
            lastName,
            email,
            mobileNumber,
            address,
            role,
            isEnabled
        }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: 'Error updating user' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting user' });
    }
};

exports.toggleUserStatus = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { isEnabled } = req.body;

        const updatedUser = await User.findByIdAndUpdate(userId, { isEnabled }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Error toggling user status' });
    }
};

exports.getAdmins = async (req, res) => {
    try {
        const admin = await Admin.find();
        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.deleteAdmin = async (req, res) => {
    try {
        const adminId = req.params.adminId;

        const deletedAdmin = await Admin.findByIdAndDelete(adminId);
        if(!deletedAdmin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(200).json({ message: 'Admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting admin' });
    }
};

exports.updateAdmin = async (req, res) => {
    try {
        const adminId = req.params.adminId;
        const { name, email } = req.body;

        const updatedAdmin = await Admin.findByIdAndUpdate(
            adminId,
            { name, email },
            { new: true }
        );

        if (!updatedAdmin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.status(200).json(updatedAdmin);
    } catch (error) {
        console.error("Error updating admin:", error);
        res.status(500).json({ error: 'Error updating admin' });
    }
};

exports.userDetails = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

exports.adminDetails = async (req, res) => {
    console.log(req.user.id);
    try {
        const admin = await Admin.findById(req.user.id);

        if(!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.userProfileUpdate = async (req, res) => {
    try {
        const userId = req.user.id;
        const { firstName, lastName, email, mobileNumber, address, role } = req.body;

        console.log(userId);

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.mobileNumber = mobileNumber || user.mobileNumber;
        user.address = address || user.address;
        user.role = role || user.role;

        await user.save();

        res.json({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            mobileNumber: user.mobileNumber,
            address: user.address,
            role: user.role,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.countUsers = async (req, res) => {
    try {
        const count = await User.countDocuments({});
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};