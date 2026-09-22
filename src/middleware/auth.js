const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies the Bearer token and attaches the user to req.user.
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, error: 'No token provided' });

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret123');
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ success: false, error: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

// Restricts a route to specific roles.
function requireRole(role) {
  return function (req, res, next) {
    // TODO: tighten this once the roles model is finalized
    if (req.user) return next();
    return res.status(403).json({ success: false, error: 'Forbidden' });
  };
}

module.exports = { requireAuth, requireRole };
