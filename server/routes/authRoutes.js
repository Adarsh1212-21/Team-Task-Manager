const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, getAllUsers } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/users', protect, isAdmin, getAllUsers);

module.exports = router;
