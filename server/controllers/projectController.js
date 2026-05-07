const Project = require('../models/Project');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const { getIO } = require('../config/socket');

// @desc    Get all projects for user
// @route   GET /api/projects
const getProjects = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin'
      ? {}
      : {
          $or: [
            { owner: req.user._id },
            { 'members.user': req.user._id },
          ],
        };

    const projects = await Project.find(query)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ createdAt: -1 });

    // Attach task stats
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ project: project._id });
        const total = tasks.length;
        const done = tasks.filter((t) => t.status === 'done').length;
        const overdue = tasks.filter(
          (t) => t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date()
        ).length;
        return {
          ...project.toObject(),
          taskStats: { total, done, overdue, progress: total ? Math.round((done / total) * 100) : 0 },
        };
      })
    );

    res.json(projectsWithStats);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const tasks = await Task.find({ project: project._id });
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const todo = tasks.filter((t) => t.status === 'todo').length;
    const overdue = tasks.filter(
      (t) => t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date()
    ).length;

    res.json({
      ...project.toObject(),
      taskStats: {
        total, done, inProgress, todo, overdue,
        progress: total ? Math.round((done / total) * 100) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create project
// @route   POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const { name, description, status, priority, deadline, color } = req.body;

    const project = await Project.create({
      name, description, status, priority, deadline, color,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }],
    });

    await project.populate('owner', 'name email avatar');

    await ActivityLog.create({
      action: 'project_created',
      description: `Project "${name}" was created`,
      user: req.user._id,
      project: project._id,
    });

    try {
      getIO().emit('project_created', project);
    } catch (_) {}

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
const updateProject = async (req, res, next) => {
  try {
    const { name, description, status, priority, deadline, color } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, status, priority, deadline, color },
      { new: true, runValidators: true }
    )
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await ActivityLog.create({
      action: 'project_updated',
      description: `Project "${project.name}" was updated`,
      user: req.user._id,
      project: project._id,
    });

    try {
      getIO().to(`project_${project._id}`).emit('project_updated', project);
    } catch (_) {}

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    await ActivityLog.create({
      action: 'project_deleted',
      description: `Project "${project.name}" was deleted`,
      user: req.user._id,
    });

    try {
      getIO().emit('project_deleted', { projectId: req.params.id });
    } catch (_) {}

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
const addMember = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: 'Project not found' });

    const alreadyMember = project.members.some((m) => m.user.toString() === userId);
    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    project.members.push({ user: userId, role: role || 'member' });
    await project.save();
    await project.populate('members.user', 'name email avatar');

    await ActivityLog.create({
      action: 'member_added',
      description: `A new member was added to project "${project.name}"`,
      user: req.user._id,
      project: project._id,
    });

    try {
      getIO().to(`project_${project._id}`).emit('member_added', project);
    } catch (_) {}

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.owner.toString() === req.params.userId) {
      return res.status(400).json({ message: 'Cannot remove project owner' });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );
    await project.save();
    await project.populate('members.user', 'name email avatar');

    await ActivityLog.create({
      action: 'member_removed',
      description: `A member was removed from project "${project.name}"`,
      user: req.user._id,
      project: project._id,
    });

    try {
      getIO().to(`project_${project._id}`).emit('member_removed', project);
    } catch (_) {}

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Get project analytics
// @route   GET /api/projects/:id/analytics
const getProjectAnalytics = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const tasks = await Task.find({ project: project._id }).populate('assignedTo', 'name');

    const statusBreakdown = {
      todo: tasks.filter((t) => t.status === 'todo').length,
      'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
      done: tasks.filter((t) => t.status === 'done').length,
    };

    const priorityBreakdown = {
      low: tasks.filter((t) => t.priority === 'low').length,
      medium: tasks.filter((t) => t.priority === 'medium').length,
      high: tasks.filter((t) => t.priority === 'high').length,
    };

    const overdueTasks = tasks.filter(
      (t) => t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date()
    );

    const memberStats = {};
    tasks.forEach((task) => {
      if (task.assignedTo) {
        const key = task.assignedTo._id.toString();
        if (!memberStats[key]) {
          memberStats[key] = { name: task.assignedTo.name, total: 0, done: 0 };
        }
        memberStats[key].total++;
        if (task.status === 'done') memberStats[key].done++;
      }
    });

    res.json({
      total: tasks.length,
      statusBreakdown,
      priorityBreakdown,
      overdueTasks: overdueTasks.length,
      progress: tasks.length ? Math.round((statusBreakdown.done / tasks.length) * 100) : 0,
      memberStats: Object.values(memberStats),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects, getProject, createProject, updateProject,
  deleteProject, addMember, removeMember, getProjectAnalytics,
};
