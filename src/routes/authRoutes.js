const express = require('express');
const { register, login, me } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.get('/me', requireAuth, me);

module.exports = router;
