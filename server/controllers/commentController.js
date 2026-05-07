const Comment = require('../models/Comment');
const ActivityLog = require('../models/ActivityLog');
const Task = require('../models/Task');
const { getIO } = require('../config/socket');

// @desc    Get comments for a task
// @route   GET /api/comments/task/:taskId
const getTaskComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('author', 'name email avatar')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment
// @route   POST /api/comments/task/:taskId
const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const comment = await Comment.create({
      content,
      task: req.params.taskId,
      author: req.user._id,
    });

    await comment.populate('author', 'name email avatar');

    await ActivityLog.create({
      action: 'comment_added',
      description: `${req.user.name} commented on task "${task.title}"`,
      user: req.user._id,
      project: task.project,
      task: task._id,
    });

    try {
      getIO().to(`task_${task._id}`).emit('comment_added', comment);
      getIO().to(`project_${task.project}`).emit('comment_added', { taskId: task._id, comment });
    } catch (_) {}

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const isAuthor = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();

    try {
      getIO().to(`task_${comment.task}`).emit('comment_deleted', { commentId: req.params.id });
    } catch (_) {}

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTaskComments, addComment, deleteComment };
