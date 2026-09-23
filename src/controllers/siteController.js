const Site = require('../models/Site');

// SECURITY FIX (OWASP A03:2021 - Injection / NoSQL Injection):
// Whitelist allowed query parameters. Direct pass-through of `req.query` previously allowed
// attackers to inject MongoDB operators like `?status[$gt]=` or `?owner[$ne]=null`.
const ALLOWED_FILTERS = ['name', 'url', 'status'];

// GET /api/sites - supports simple filtering via query string
async function listSites(req, res, next) {
  try {
    // SECURITY FIX: Whitelist filter fields and reject non-primitive string values to block NoSQL operator injection.
    const filter = {};
    for (const key of ALLOWED_FILTERS) {
      if (req.query[key] !== undefined) {
        if (typeof req.query[key] !== 'string') {
          return res.status(400).json({ success: false, error: `Invalid value for filter "${key}"` });
        }
        filter[key] = req.query[key];
      }
    }

    // RELIABILITY & DoS MITIGATION (OWASP A05:2021):
    // Implemented bounded pagination to prevent memory exhaustion and database timeouts on large collections.
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const skip = (page - 1) * limit;

    const [sites, total] = await Promise.all([
      Site.find(filter).populate('owner', 'name email').skip(skip).limit(limit),
      Site.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: sites,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

async function getSite(req, res, next) {
  try {
    const site = await Site.findById(req.params.id).populate('owner', 'name email');
    if (!site) return res.status(404).json({ success: false, error: 'Site not found' });
    res.json({ success: true, data: site });
  } catch (err) {
    next(err);
  }
}

async function createSite(req, res, next) {
  try {
    const site = await Site.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ success: true, data: site });
  } catch (err) {
    next(err);
  }
}

async function updateSite(req, res, next) {
  try {
    const site = await Site.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!site) return res.status(404).json({ success: false, error: 'Site not found' });
    res.json({ success: true, data: site });
  } catch (err) {
    next(err);
  }
}

async function deleteSite(req, res, next) {
  try {
    await Site.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}

module.exports = { listSites, getSite, createSite, updateSite, deleteSite };
