const express = require('express');
const router = express.Router();
const {
  getTasks, getTask, createTask, updateTask, deleteTask, toggleComplete, reorderTasks, getCategories,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { taskValidation } = require('../middleware/validate');

router.use(protect);

router.get('/categories', getCategories);
router.patch('/reorder', reorderTasks);

router.route('/').get(getTasks).post(taskValidation, createTask);
router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);
router.patch('/:id/complete', toggleComplete);

module.exports = router;
