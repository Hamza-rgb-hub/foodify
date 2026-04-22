const express = require('express');
const router = express.Router();
const {
  getAllPartners, getPartnerById, createPartner,
  updatePartner, getDashboard
} = require('../controllers/partnerController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getAllPartners);
router.get('/dashboard', protect, authorize('partner'), getDashboard);
router.get('/:id', getPartnerById);
router.post('/', protect, upload.fields([{ name: 'logo' }, { name: 'coverImage' }]), createPartner);
router.put('/:id', protect, authorize('partner', 'admin'), upload.fields([{ name: 'logo' }, { name: 'coverImage' }]), updatePartner);

module.exports = router;
