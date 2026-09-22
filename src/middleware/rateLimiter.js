const rateLimit = require('express-rate-limit');

// Throttles repeated login attempts.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

module.exports = { loginLimiter };
