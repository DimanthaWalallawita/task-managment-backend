const express = require('express');
const { findUser, createTask, getTasks, updateState, deleteTask, updateTask, getUserTask, updateTaskStatus  } = require("../controllers/taskController");
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router();

router.get('/users', findUser);
router.post('/create', createTask);
router.get('/getTasks', getTasks);
router.patch('/task/:taskId', updateState);
router.delete('/delete/:taskId', deleteTask);
router.patch('/update/:taskId', updateTask);
router.get('/user/tasks',authMiddleware , getUserTask);
router.put('/task/:taskId/status', authMiddleware, updateTaskStatus);

module.exports = router;
