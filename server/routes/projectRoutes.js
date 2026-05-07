const express = require('express');
const router = express.Router();
const {
  getProjects, getProject, createProject, updateProject,
  deleteProject, addMember, removeMember, getProjectAnalytics,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { isProjectAdmin, isProjectMember } = require('../middleware/roleMiddleware');
const { validateProject } = require('../middleware/validationMiddleware');

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(validateProject, createProject);

router.route('/:id')
  .get(isProjectMember, getProject)
  .put(isProjectAdmin, validateProject, updateProject)
  .delete(isProjectAdmin, deleteProject);

router.get('/:id/analytics', isProjectMember, getProjectAnalytics);
router.post('/:id/members', isProjectAdmin, addMember);
router.delete('/:id/members/:userId', isProjectAdmin, removeMember);

module.exports = router;
