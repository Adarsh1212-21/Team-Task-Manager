const express = require('express');
const router = express.Router();
const {
  getProjectTasks, getMyTasks, getTask, createTask,
  updateTask, deleteTask, reorderTasks, getDashboardStats,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { validateTask } = require('../middleware/validationMiddleware');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/my', getMyTasks);
router.get('/project/:projectId', getProjectTasks);
router.put('/reorder', reorderTasks);

router.route('/')
  .post(validateTask, createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
