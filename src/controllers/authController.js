const jwt = require('jsonwebtoken');
const User = require('../models/User');

// SECURITY FIX (OWASP A02:2021 - Cryptographic Failures):
// Fail fast if JWT_SECRET is missing. Removed hardcoded fallback ('devsecret123')
// to prevent tokens from being signed or verified with a publicly known secret.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set. Refusing to start with insecure defaults.');
}

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    // SECURITY FIX (OWASP A01:2021 - Broken Access Control / Privilege Escalation):
    // Previously, `role` was accepted directly from `req.body`, allowing anyone to register as 'admin'.
    // Now `role` is explicitly ignored on registration and defaults strictly to 'viewer'.

    // SECURITY FIX: Basic input validation on required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, error: 'Email already in use' });

    const user = await User.create({ name, email, password });
    const token = signToken(user);
    // SECURITY FIX (OWASP A04:2021 - Sensitive Data Exposure):
    // Do not return raw user object containing password hash; return only JWT token.
    res.status(201).json({ success: true, data: { token } });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const token = signToken(user);
    res.json({ success: true, data: { token, user } });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function me(req, res) {
  res.json({ success: true, data: { user: req.user } });
}

module.exports = { register, login, me };
