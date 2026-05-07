const Project = require('../models/Project');


const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Admin only.' });
};


const isProjectAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId || req.body.project;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isOwner = project.owner.toString() === req.user._id.toString();
    const memberEntry = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    const isProjectAdminRole = memberEntry && memberEntry.role === 'admin';
    const isGlobalAdmin = req.user.role === 'admin';

    if (isOwner || isProjectAdminRole || isGlobalAdmin) {
      req.project = project;
      return next();
    }

    return res.status(403).json({ message: 'Access denied. Project admin only.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


const isProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.project || req.params.id;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    const isGlobalAdmin = req.user.role === 'admin';

    if (isOwner || isMember || isGlobalAdmin) {
      req.project = project;
      return next();
    }

    return res.status(403).json({ message: 'Access denied. Not a project member.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { isAdmin, isProjectAdmin, isProjectMember };
