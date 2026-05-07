const express = require('express');
const router = express.Router();
const { getProjectActivities, getAllActivities } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', isAdmin, getAllActivities);
router.get('/project/:projectId', getProjectActivities);

module.exports = router;
