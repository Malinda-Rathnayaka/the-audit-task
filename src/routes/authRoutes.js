const express = require('express');
const { register, login, me } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
// SECURITY FIX (OWASP A07:2021 - Identification & Authentication Failures):
// Rate limiter previously commented out; now imported to protect against brute-force attacks.
const { loginLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', register);
// SECURITY FIX: Attached loginLimiter middleware to throttle repeated failed login attempts
router.post('/login', loginLimiter, login);
router.get('/me', requireAuth, me);

module.exports = router;
