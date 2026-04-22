const express = require('express');
const router = express.Router();
const {
  placeOrder, getMyOrders, getOrderById, updateOrderStatus,
  cancelOrder, getPartnerOrders
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, placeOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/partner-orders', protect, authorize('partner', 'admin'), getPartnerOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, authorize('partner', 'admin'), updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
