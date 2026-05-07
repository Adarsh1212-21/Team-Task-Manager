const Task = require('../models/Task');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const { getIO } = require('../config/socket');

// @desc    Get tasks for a project
// @route   GET /api/tasks/project/:projectId
const getProjectTasks = async (req, res, next) => {
  try {
    const { status, priority, assignedTo, search } = req.query;
    const filter = { project: req.params.projectId };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ order: 1, createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks assigned to current user
// @route   GET /api/tasks/my
const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('project', 'name color')
      .populate('assignedTo', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name color');

    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Create task
// @route   POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, deadline, project, tags } = req.body;
const assignedTo = req.body.assignedTo || null;

    const task = await Task.create({
      title, description, status, priority, deadline, project, assignedTo,
      createdBy: req.user._id,
    });

    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    await ActivityLog.create({
      action: 'task_created',
      description: `Task "${title}" was created`,
      user: req.user._id,
      project,
      task: task._id,
    });

    if (assignedTo) {
      await ActivityLog.create({
        action: 'task_assigned',
        description: `Task "${title}" was assigned`,
        user: req.user._id,
        project,
        task: task._id,
      });
    }

    try {
      getIO().to(`project_${project}`).emit('task_created', task);
    } catch (_) {}

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const oldTask = await Task.findById(req.params.id);
    if (!oldTask) return res.status(404).json({ message: 'Task not found' });

    // Members can only update status of their own tasks
    if (req.user.role === 'member') {
      const isAssigned = oldTask.assignedTo?.toString() === req.user._id.toString();
      if (!isAssigned) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }
      // Members can only update status
      const allowedFields = ['status'];
      Object.keys(req.body).forEach((key) => {
        if (!allowedFields.includes(key)) delete req.body[key];
      });
    }
if (req.body.assignedTo === '') {
  req.body.assignedTo = null;
}
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (req.body.status && req.body.status !== oldTask.status) {
      await ActivityLog.create({
        action: 'status_changed',
        description: `Task "${task.title}" status changed to "${req.body.status}"`,
        user: req.user._id,
        project: task.project,
        task: task._id,
        metadata: { from: oldTask.status, to: req.body.status },
      });
    } else {
      await ActivityLog.create({
        action: 'task_updated',
        description: `Task "${task.title}" was updated`,
        user: req.user._id,
        project: task.project,
        task: task._id,
      });
    }

    try {
      getIO().to(`project_${task.project}`).emit('task_updated', task);
    } catch (_) {}

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const projectId = task.project;
    await task.deleteOne();

    await ActivityLog.create({
      action: 'task_deleted',
      description: `Task "${task.title}" was deleted`,
      user: req.user._id,
      project: projectId,
    });

    try {
      getIO().to(`project_${projectId}`).emit('task_deleted', { taskId: req.params.id });
    } catch (_) {}

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task order (drag and drop)
// @route   PUT /api/tasks/reorder
const reorderTasks = async (req, res, next) => {
  try {
    const { tasks } = req.body; // Array of { id, status, order }
    await Promise.all(
      tasks.map((t) =>
        Task.findByIdAndUpdate(t.id, { status: t.status, order: t.order })
      )
    );

    try {
      const projectId = req.body.projectId;
      if (projectId) getIO().to(`project_${projectId}`).emit('tasks_reordered', tasks);
    } catch (_) {}

    res.json({ message: 'Tasks reordered' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/tasks/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    let taskFilter = {};
    let projectFilter = {};

    if (req.user.role !== 'admin') {
      taskFilter = {
        $or: [
          { assignedTo: req.user._id },
          { createdBy: req.user._id },
        ],
      };
      projectFilter = {
        $or: [
          { owner: req.user._id },
          { 'members.user': req.user._id },
        ],
      };
    }

    const allTasks = await Task.find(taskFilter);
    const now = new Date();

    const stats = {
      total: allTasks.length,
      completed: allTasks.filter((t) => t.status === 'done').length,
      inProgress: allTasks.filter((t) => t.status === 'in-progress').length,
      todo: allTasks.filter((t) => t.status === 'todo').length,
      overdue: allTasks.filter(
        (t) => t.status !== 'done' && t.deadline && new Date(t.deadline) < now
      ).length,
    };

    const Project = require('../models/Project');
    const projects = await Project.find(projectFilter);
    stats.totalProjects = projects.length;

    // Recent tasks
    const recentTasks = await Task.find(taskFilter)
      .populate('project', 'name color')
      .populate('assignedTo', 'name avatar')
      .sort({ updatedAt: -1 })
      .limit(5);

    res.json({ stats, recentTasks });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectTasks, getMyTasks, getTask, createTask,
  updateTask, deleteTask, reorderTasks, getDashboardStats,
};
