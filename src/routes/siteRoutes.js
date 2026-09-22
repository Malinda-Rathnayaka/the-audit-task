const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  listSites, getSite, createSite, updateSite, deleteSite,
} = require('../controllers/siteController');

const router = express.Router();

router.use(requireAuth);

router.get('/', listSites);
router.get('/:id', getSite);
router.post('/', requireRole('admin'), createSite);
router.patch('/:id', requireRole('admin'), updateSite);
router.delete('/:id', requireRole('admin'), deleteSite);

module.exports = router;
