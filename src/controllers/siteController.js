const Site = require('../models/Site');

// GET /api/sites - supports simple filtering via query string
async function listSites(req, res, next) {
  try {
    // Pass query params straight through as the Mongo filter.
    const sites = await Site.find(req.query).populate('owner', 'name email');
    res.json({ success: true, data: sites });
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
