const Order = require('../models/Order');
const Food = require('../models/Food');
const Partner = require('../models/Partner');
const User = require('../models/User');

// @desc    Place new order
// @route   POST /api/orders
exports.placeOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, partnerId, pricing, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must have at least one item' });
    }

    // Validate all items belong to same partner
    const foodIds = items.map(item => item.food);
    const foods = await Food.find({ _id: { $in: foodIds } });

    const orderItems = items.map(item => {
      const food = foods.find(f => f._id.toString() === item.food);
      if (!food) throw new Error(`Food item not found: ${item.food}`);
      if (!food.isAvailable) throw new Error(`${food.name} is currently unavailable`);
      return {
        food: food._id,
        name: food.name,
        price: food.discountedPrice || food.price,
        quantity: item.quantity,
        image: food.images?.[0]?.url || ''
      };
    });

    const order = await Order.create({
      user: req.user.id,
      partner: partnerId,
      items: orderItems,
      deliveryAddress,
      paymentMethod,
      pricing,
      notes
    });

    // Clear cart
    await User.findByIdAndUpdate(req.user.id, { cart: [] });

    // Update food total orders
    await Food.updateMany(
      { _id: { $in: foodIds } },
      { $inc: { totalOrders: 1 } }
    );

    await order.populate([
      { path: 'partner', select: 'shopName logo phone' },
      { path: 'items.food', select: 'name images' }
    ]);

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { user: req.user.id };
    if (status) query.orderStatus = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .populate('partner', 'shopName logo')
      .populate('items.food', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: orders,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('partner', 'shopName logo phone address')
      .populate('items.food', 'name images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check authorization
    const isOwner = order.user._id.toString() === req.user.id;
    const partner = await Partner.findOne({ user: req.user.id });
    const isPartner = partner && order.partner._id.toString() === partner._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isPartner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (Partner/Admin)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const partner = await Partner.findOne({ user: req.user.id });
    const isPartner = partner && order.partner.toString() === partner._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPartner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const validTransitions = {
      placed: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['out_for_delivery'],
      out_for_delivery: ['delivered'],
      delivered: [],
      cancelled: []
    };

    if (!validTransitions[order.orderStatus]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${order.orderStatus} to ${status}`
      });
    }

    order.orderStatus = status;
    if (note) order.statusHistory[order.statusHistory.length - 1].note = note;
    
    if (status === 'delivered') {
      order.actualDeliveryTime = new Date();
      order.paymentStatus = order.paymentMethod === 'cod' ? 'paid' : order.paymentStatus;
      
      // Update partner stats
      if (partner) {
        await Partner.findByIdAndUpdate(partner._id, {
          $inc: { totalOrders: 1, totalRevenue: order.pricing.total }
        });
      }
    }

    await order.save();
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!['placed', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
    }

    order.orderStatus = 'cancelled';
    order.cancelReason = req.body.reason || 'Cancelled by user';
    await order.save();

    res.json({ success: true, data: order, message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get partner orders
// @route   GET /api/orders/partner-orders
exports.getPartnerOrders = async (req, res) => {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }

    const { page = 1, limit = 20, status } = req.query;
    const query = { partner: partner._id };
    if (status) query.orderStatus = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .populate('user', 'name phone email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: orders,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
