const express = require('express');
const Task = require('../models/Task');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all task routes
router.use(authMiddleware);

// Get all tasks for the logged in user
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user }).sort({ createdAt: -1 });
    // Map _id to id for frontend compatibility
    const mappedTasks = tasks.map(task => {
      const taskObj = task.toObject();
      taskObj.id = taskObj._id.toString();
      return taskObj;
    });
    res.json(mappedTasks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create a new task
router.post('/', async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, category } = req.body;
    
    const newTask = new Task({
      title,
      description,
      status,
      priority,
      dueDate,
      category,
      user: req.user
    });

    const savedTask = await newTask.save();
    const taskObj = savedTask.toObject();
    taskObj.id = taskObj._id.toString();
    
    res.status(201).json(taskObj);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update a task
router.put('/:id', async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    const taskObj = task.toObject();
    taskObj.id = taskObj._id.toString();

    res.json(taskObj);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
