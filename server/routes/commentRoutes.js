const express = require('express');
const router = express.Router();
const { getTaskComments, addComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const { validateComment } = require('../middleware/validationMiddleware');

router.use(protect);

router.get('/task/:taskId', getTaskComments);
router.post('/task/:taskId', validateComment, addComment);
router.delete('/:id', deleteComment);

module.exports = router;
