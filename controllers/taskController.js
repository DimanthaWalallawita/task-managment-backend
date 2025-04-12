const Task = require('../models/Task');
const User = require('../models/User');
require('dotenv').config();
const mongoose = require('mongoose');

exports.findUser = async (req, res) => {
    try {
        const users = await User.find({ isEnabled: true }).select('firstName lastName');

        const userList = users.map(user => ({
            id: user.id,
            fullName: `${user.firstName} ${user.lastName}`
        }));

        res.status(200).json(userList);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};

exports.createTask = async (req, res) => {
    try {
        const { taskName, description, startDate, endDate, assignedUser, isEnabled } = req.body;

        if (!taskName || !startDate || !endDate || !assignedUser) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newTask = new Task({
            taskName,
            description,
            startDate,
            endDate,
            assignedUser,
            isEnabled
        })

        await newTask.save();

        res.status(200).json({ message: 'Task is created successfully', task: newTask });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('assignedUser', 'firstName lastName')
            .exec();;

        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.updateState = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { isEnabled } = req.body;

        const updatedTask = await Task.findByIdAndUpdate(taskId, { isEnabled }, { new: true });

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error('Error updating task status:', error);
        res.status(500).json({ message: 'Failed to update task status' });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const deletedTask = await Task.findByIdAndDelete(taskId);

        if (!deletedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Failed to delete task' });
    }
};

exports.updateTask = async (req, res) => {
    const { taskId } = req.params;
    const { taskName, description, startDate, endDate, assignedUser, isCompleted, isEnabled } = req.body;

    try {
        const task = await Task.findByIdAndUpdate(taskId, {
            taskName,
            description,
            startDate,
            endDate,
            assignedUser,
            isCompleted,
            isEnabled,
        }, { new: true });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error updating task' });
    }
};

exports.getUserTask = async (req, res) => {
    try {
        const userId = req.user.id;

        const tasks = await Task.find({ assignedUser: userId, isEnabled: true });

        if (!tasks.length) {
            return res.status(404).json({ message: "No tasks found for this user." });
        }

        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;  // Getting taskId from the URL parameters

        console.log("Received taskId:", taskId);  // Debugging log

        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ message: "Invalid task ID" });
        }

        const { status } = req.body;

        if (!["Pending", "Completed"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value." });
        }

        // Find the task by ID
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: "Task not found." });
        }

        // Update the task's status
        if (status === "Completed" && !task.isCompleted) {
            task.isCompleted = true;
            task.completionDate = new Date();  // Set completion date
        } else if (status === "Pending" && task.isCompleted) {
            task.isCompleted = false;
            task.completionDate = null;  // Reset completion date
        }

        // Save the updated task
        await task.save();

        return res.json({ status: task.isCompleted ? "Completed" : "Pending", task });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.countTasks = async (req, res) => {
    try {
        const countTask = await Task.countDocuments({ isCompleted: true });
        res.status(200).json({ countTask });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.countTasksPending = async (req, res) => {
    try {
        const countTask = await Task.countDocuments({ isCompleted: false });
        res.status(200).json({ countTask });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getRecentTasks = async (req, res) => {
    try {
        const response = await Task.find({ isEnabled: true })
        .sort({ createdAt: -1 })
        .limit(4)
        .populate('assignedUser', 'firstName lastName');

        const formattedTasks = response.map(task => ({
            _id: task._id,
            taskName: task.taskName,
            startDate: task.startDate,
            endDate: task.endDate,
            assignedUser: {
                _id: task.assignedUser?._id,
                fullName: task.assignedUser
                    ? `${task.assignedUser.firstName} ${task.assignedUser.lastName}` 
                    : 'Unassigned'
            },
            isCompleted: task.isCompleted,
            createdAt: task.createdAt
        }));

        res.status(200).json(formattedTasks);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};
