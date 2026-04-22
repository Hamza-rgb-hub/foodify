const express = require('express');
const router = express.Router();
const {
  getAllFood, getFoodById, createFood, updateFood,
  deleteFood, addReview, getPartnerFood
} = require('../controllers/foodController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getAllFood);
router.get('/partner/:partnerId', getPartnerFood);
router.get('/:id', getFoodById);
router.post('/', protect, authorize('partner', 'admin'), upload.array('images', 5), createFood);
router.put('/:id', protect, authorize('partner', 'admin'), upload.array('images', 5), updateFood);
router.delete('/:id', protect, authorize('partner', 'admin'), deleteFood);
router.post('/:id/review', protect, addReview);

module.exports = router;
