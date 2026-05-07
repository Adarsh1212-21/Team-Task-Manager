const ActivityLog = require('../models/ActivityLog');

// @desc    Get activity logs for a project
// @route   GET /api/activities/project/:projectId
const getProjectActivities = async (req, res, next) => {
  try {
    const activities = await ActivityLog.find({ project: req.params.projectId })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(activities);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all activity logs (admin)
// @route   GET /api/activities
const getAllActivities = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const activities = await ActivityLog.find({})
      .populate('user', 'name email avatar')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ActivityLog.countDocuments();

    res.json({ activities, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProjectActivities, getAllActivities };
