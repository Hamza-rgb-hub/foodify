const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Food = require('../models/Food');
const { protect } = require('../middleware/auth');

// Get cart
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'cart.food',
      populate: { path: 'partner', select: 'shopName slug deliveryFee deliveryTime isOpen' }
    });
    res.json({ success: true, data: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add to cart
router.post('/add', protect, async (req, res) => {
  try {
    const { foodId, quantity = 1 } = req.body;
    const food = await Food.findById(foodId);
    if (!food) return res.status(404).json({ success: false, message: 'Food not found' });

    const user = await User.findById(req.user.id);
    const cartIndex = user.cart.findIndex(item => item.food.toString() === foodId);

    if (cartIndex > -1) {
      user.cart[cartIndex].quantity += quantity;
    } else {
      user.cart.push({ food: foodId, quantity });
    }

    await user.save();
    await user.populate({ path: 'cart.food', populate: { path: 'partner', select: 'shopName slug deliveryFee' } });

    res.json({ success: true, data: user.cart, message: 'Added to cart' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update cart item quantity
router.put('/update', protect, async (req, res) => {
  try {
    const { foodId, quantity } = req.body;
    const user = await User.findById(req.user.id);

    if (quantity <= 0) {
      user.cart = user.cart.filter(item => item.food.toString() !== foodId);
    } else {
      const cartIndex = user.cart.findIndex(item => item.food.toString() === foodId);
      if (cartIndex > -1) user.cart[cartIndex].quantity = quantity;
    }

    await user.save();
    await user.populate({ path: 'cart.food', populate: { path: 'partner', select: 'shopName slug deliveryFee' } });

    res.json({ success: true, data: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove from cart
router.delete('/remove/:foodId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter(item => item.food.toString() !== req.params.foodId);
    await user.save();
    res.json({ success: true, data: user.cart, message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Clear cart
router.delete('/clear', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { cart: [] });
    res.json({ success: true, data: [], message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
