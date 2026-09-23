const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies the Bearer token and attaches the user to req.user.
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, error: 'No token provided' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ success: false, error: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    // SECURITY FIX (OWASP A04:2021 & Reliability): Catch JWT-specific validation errors
    // and return a clean HTTP 401 instead of letting errors bubble up to 500 with leaked stack traces.
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError' || err.name === 'NotBeforeError') {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
    next(err);
  }
}

// Restricts a route to specific roles.
function requireRole(...roles) {
  return function (req, res, next) {
    // SECURITY FIX (OWASP A01:2021 - Broken Access Control):
    // Previously, this only checked `if (req.user)` and allowed any authenticated user (such as viewers)
    // to perform administrative actions. Now properly enforces role authorization by checking if
    // the user's role is in the authorized roles list.
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole };
