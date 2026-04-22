// const User = require('../models/User');
// const Partner = require('../models/Partner');
// const Order = require('../models/Order');
// const Food = require('../models/Food');
// const Category = require('../models/Category');

// // @desc    Get admin dashboard stats
// // @route   GET /api/admin/dashboard
// exports.getDashboard = async (req, res) => {
//   try {
//     const [
//       totalUsers,
//       totalPartners,
//       totalOrders,
//       pendingPartners,
//       todayOrders,
//       recentOrders
//     ] = await Promise.all([
//       User.countDocuments({ role: 'user' }),
//       Partner.countDocuments(),
//       Order.countDocuments(),
//       Partner.countDocuments({ isApproved: false }),
//       Order.countDocuments({
//         createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
//       }),
//       Order.find()
//         .populate('user', 'name email')
//         .populate('partner', 'shopName')
//         .sort({ createdAt: -1 })
//         .limit(10)
//     ]);

//     const revenueData = await Order.aggregate([
//       { $match: { orderStatus: 'delivered' } },
//       {
//         $group: {
//           _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
//           revenue: { $sum: '$pricing.total' },
//           orders: { $sum: 1 }
//         }
//       },
//       { $sort: { _id: -1 } },
//       { $limit: 30 }
//     ]);

//     const totalRevenue = await Order.aggregate([
//       { $match: { orderStatus: 'delivered' } },
//       { $group: { _id: null, total: { $sum: '$pricing.total' } } }
//     ]);

//     res.json({
//       success: true,
//       data: {
//         stats: {
//           totalUsers,
//           totalPartners,
//           totalOrders,
//           pendingPartners,
//           todayOrders,
//           totalRevenue: totalRevenue[0]?.total || 0
//         },
//         recentOrders,
//         revenueData: revenueData.reverse()
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Get all users
// exports.getUsers = async (req, res) => {
//   try {
//     const { page = 1, limit = 20, role, search } = req.query;
//     const query = {};
//     if (role) query.role = role;
//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } }
//       ];
//     }

//     const skip = (Number(page) - 1) * Number(limit);
//     const [users, total] = await Promise.all([
//       User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
//       User.countDocuments(query)
//     ]);

//     res.json({
//       success: true,
//       data: users,
//       pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Block/Unblock user
// exports.toggleUserBlock = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) return res.status(404).json({ success: false, message: 'User not found' });

//     user.isBlocked = !user.isBlocked;
//     await user.save();

//     res.json({
//       success: true,
//       message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
//       data: user
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Approve/reject partner
// exports.approvePartner = async (req, res) => {
//   try {
//     const { isApproved } = req.body;
//     const partner = await Partner.findByIdAndUpdate(
//       req.params.id,
//       { isApproved },
//       { new: true }
//     ).populate('user', 'name email');

//     if (!partner) return res.status(404).json({ success: false, message: 'Partner not found' });

//     res.json({
//       success: true,
//       message: `Partner ${isApproved ? 'approved' : 'rejected'} successfully`,
//       data: partner
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Get all orders (admin)
// exports.getAllOrders = async (req, res) => {
//   try {
//     const { page = 1, limit = 20, status } = req.query;
//     const query = {};
//     if (status) query.orderStatus = status;

//     const skip = (Number(page) - 1) * Number(limit);
//     const [orders, total] = await Promise.all([
//       Order.find(query)
//         .populate('user', 'name email phone')
//         .populate('partner', 'shopName')
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(Number(limit)),
//       Order.countDocuments(query)
//     ]);

//     res.json({
//       success: true,
//       data: orders,
//       pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    CRUD Categories
// exports.createCategory = async (req, res) => {
//   try {
//     const category = await Category.create(req.body);
//     res.status(201).json({ success: true, data: category });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// exports.updateCategory = async (req, res) => {
//   try {
//     const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
//     res.json({ success: true, data: category });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// exports.deleteCategory = async (req, res) => {
//   try {
//     await Category.findByIdAndDelete(req.params.id);
//     res.json({ success: true, message: 'Category deleted' });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



const User = require('../models/User');
const Partner = require('../models/Partner');
const Order = require('../models/Order');
const Food = require('../models/Food');
const Category = require('../models/Category');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalPartners,
      totalOrders,
      pendingPartners,
      todayOrders,
      recentOrders
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Partner.countDocuments(),
      Order.countDocuments(),
      Partner.countDocuments({ isApproved: false }),
      Order.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
      }),
      Order.find()
        .populate('user', 'name email')
        .populate('partner', 'shopName')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    const revenueData = await Order.aggregate([
      { $match: { orderStatus: 'delivered' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$pricing.total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    const totalRevenue = await Order.aggregate([
      { $match: { orderStatus: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalPartners,
          totalOrders,
          pendingPartners,
          todayOrders,
          totalRevenue: totalRevenue[0]?.total || 0
        },
        recentOrders,
        revenueData: revenueData.reverse()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Block/Unblock user
exports.toggleUserBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get ALL partners (admin only - no filters, includes unapproved)
exports.getAllPartners = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { shopName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // status filter: 'pending' | 'approved' | 'blocked'
    if (status === 'pending') query.isApproved = false;
    else if (status === 'approved') query.isApproved = true;
    else if (status === 'blocked') query.isBlocked = true;

    const skip = (Number(page) - 1) * Number(limit);
    const [partners, total] = await Promise.all([
      Partner.find(query)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Partner.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: partners,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve/reject partner
exports.approvePartner = async (req, res) => {
  try {
    const { isApproved } = req.body;
    const partner = await Partner.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    ).populate('user', 'name email');

    if (!partner) return res.status(404).json({ success: false, message: 'Partner not found' });

    res.json({
      success: true,
      message: `Partner ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: partner
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.orderStatus = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email phone')
        .populate('partner', 'shopName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    CRUD Categories
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};