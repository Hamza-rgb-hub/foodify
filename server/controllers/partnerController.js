// const Partner = require('../models/Partner');
// const User = require('../models/User');
// const Order = require('../models/Order');
// const Food = require('../models/Food');

// // @desc    Get all partners
// // @route   GET /api/partners
// exports.getAllPartners = async (req, res) => {
//   try {
//     const { search, cuisine, isOpen, page = 1, limit = 12, sortBy } = req.query;
//     const query = { isApproved: true, isBlocked: false };

//     if (search) {
//       query.$or = [
//         { shopName: { $regex: search, $options: 'i' } },
//         { description: { $regex: search, $options: 'i' } }
//       ];
//     }
//     if (cuisine) query.cuisine = { $in: [cuisine] };
//     if (isOpen === 'true') query.isOpen = true;

//     let sortOptions = {};
//     switch (sortBy) {
//       case 'rating': sortOptions = { 'rating.average': -1 }; break;
//       case 'orders': sortOptions = { totalOrders: -1 }; break;
//       default: sortOptions = { createdAt: -1 };
//     }

//     const skip = (Number(page) - 1) * Number(limit);
//     const total = await Partner.countDocuments(query);
//     const partners = await Partner.find(query)
//       .populate('user', 'name email')
//       .sort(sortOptions)
//       .skip(skip)
//       .limit(Number(limit));

//     res.json({
//       success: true,
//       data: partners,
//       pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Get partner by ID or slug
// // @route   GET /api/partners/:id
// exports.getPartnerById = async (req, res) => {
//   try {
//     const query = req.params.id.match(/^[0-9a-fA-F]{24}$/)
//       ? { _id: req.params.id }
//       : { slug: req.params.id };

//     const partner = await Partner.findOne(query)
//       .populate('user', 'name email');

//     if (!partner) {
//       return res.status(404).json({ success: false, message: 'Partner not found' });
//     }

//     res.json({ success: true, data: partner });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Create partner profile
// // @route   POST /api/partners
// exports.createPartner = async (req, res) => {
//   try {
//     const existing = await Partner.findOne({ user: req.user.id });
//     if (existing) {
//       return res.status(400).json({ success: false, message: 'Partner profile already exists' });
//     }

//     const partnerData = { ...req.body, user: req.user.id };

//     if (req.files) {
//       if (req.files.logo) {
//         partnerData.logo = req.files.logo[0].path || `/uploads/${req.files.logo[0].filename}`;
//       }
//       if (req.files.coverImage) {
//         partnerData.coverImage = req.files.coverImage[0].path || `/uploads/${req.files.coverImage[0].filename}`;
//       }
//     }

//     // Ensure user role is partner
//     await User.findByIdAndUpdate(req.user.id, { role: 'partner' });

//     const partner = await Partner.create(partnerData);
//     res.status(201).json({ success: true, data: partner });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Update partner profile
// // @route   PUT /api/partners/:id
// exports.updatePartner = async (req, res) => {
//   try {
//     let partner = await Partner.findOne({ user: req.user.id });
//     if (!partner) {
//       return res.status(404).json({ success: false, message: 'Partner not found' });
//     }

//     const updateData = { ...req.body };
//     if (req.files) {
//       if (req.files.logo) {
//         updateData.logo = req.files.logo[0].path || `/uploads/${req.files.logo[0].filename}`;
//       }
//       if (req.files.coverImage) {
//         updateData.coverImage = req.files.coverImage[0].path || `/uploads/${req.files.coverImage[0].filename}`;
//       }
//     }

//     partner = await Partner.findByIdAndUpdate(partner._id, updateData, {
//       new: true,
//       runValidators: true
//     });

//     res.json({ success: true, data: partner });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Get partner dashboard stats
// // @route   GET /api/partners/dashboard
// exports.getDashboard = async (req, res) => {
//   try {
//     const partner = await Partner.findOne({ user: req.user.id });
//     if (!partner) {
//       return res.status(404).json({ success: false, message: 'Partner not found' });
//     }

//     const [
//       totalOrders,
//       pendingOrders,
//       todayOrders,
//       totalFoods,
//       recentOrders,
//       ordersByStatus
//     ] = await Promise.all([
//       Order.countDocuments({ partner: partner._id }),
//       Order.countDocuments({ partner: partner._id, orderStatus: { $in: ['placed', 'confirmed', 'preparing'] } }),
//       Order.countDocuments({
//         partner: partner._id,
//         createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
//       }),
//       Food.countDocuments({ partner: partner._id }),
//       Order.find({ partner: partner._id })
//         .populate('user', 'name phone')
//         .sort({ createdAt: -1 })
//         .limit(5),
//       Order.aggregate([
//         { $match: { partner: partner._id } },
//         { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
//       ])
//     ]);

//     // Revenue for last 7 days
//     const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
//     const revenueByDay = await Order.aggregate([
//       {
//         $match: {
//           partner: partner._id,
//           orderStatus: 'delivered',
//           createdAt: { $gte: sevenDaysAgo }
//         }
//       },
//       {
//         $group: {
//           _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
//           revenue: { $sum: '$pricing.total' },
//           orders: { $sum: 1 }
//         }
//       },
//       { $sort: { _id: 1 } }
//     ]);

//     res.json({
//       success: true,
//       data: {
//         stats: {
//           totalOrders,
//           pendingOrders,
//           todayOrders,
//           totalFoods,
//           totalRevenue: partner.totalRevenue,
//           rating: partner.rating
//         },
//         recentOrders,
//         ordersByStatus,
//         revenueByDay
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


const Partner = require('../models/Partner');
const User = require('../models/User');
const Order = require('../models/Order');
const Food = require('../models/Food');

// @desc    Get all partners
// @route   GET /api/partners
exports.getAllPartners = async (req, res) => {
  try {
    const { search, cuisine, isOpen, page = 1, limit = 12, sortBy } = req.query;
    const query = { isApproved: true, isBlocked: false };

    if (search) {
      query.$or = [
        { shopName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (cuisine) query.cuisine = { $in: [cuisine] };
    if (isOpen === 'true') query.isOpen = true;

    let sortOptions = {};
    switch (sortBy) {
      case 'rating': sortOptions = { 'rating.average': -1 }; break;
      case 'orders': sortOptions = { totalOrders: -1 }; break;
      default: sortOptions = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Partner.countDocuments(query);
    const partners = await Partner.find(query)
      .populate('user', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: partners,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get partner by ID or slug
// @route   GET /api/partners/:id
exports.getPartnerById = async (req, res) => {
  try {
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: req.params.id }
      : { slug: req.params.id };

    const partner = await Partner.findOne(query)
      .populate('user', 'name email');

    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }

    res.json({ success: true, data: partner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create partner profile
// @route   POST /api/partners
exports.createPartner = async (req, res) => {
  try {
    const existing = await Partner.findOne({ user: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Partner profile already exists' });
    }

    const partnerData = { ...req.body, user: req.user.id };

    foodData.images = req.files.map(file => ({
      url: file.path,          // Cloudinary secure URL
      public_id: file.filename // Cloudinary public_id
    }));

    // Ensure user role is partner
    await User.findByIdAndUpdate(req.user.id, { role: 'partner' });

    const partner = await Partner.create(partnerData);
    res.status(201).json({ success: true, data: partner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update partner profile
// @route   PUT /api/partners/:id
exports.updatePartner = async (req, res) => {
  try {
    let partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }

    const updateData = { ...req.body };
    foodData.images = req.files.map(file => ({
      url: file.path,          // Cloudinary secure URL
      public_id: file.filename // Cloudinary public_id
    }));

    partner = await Partner.findByIdAndUpdate(partner._id, updateData, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: partner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get partner dashboard stats
// @route   GET /api/partners/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }

    const [
      totalOrders,
      pendingOrders,
      todayOrders,
      totalFoods,
      recentOrders,
      ordersByStatus
    ] = await Promise.all([
      Order.countDocuments({ partner: partner._id }),
      Order.countDocuments({ partner: partner._id, orderStatus: { $in: ['placed', 'confirmed', 'preparing'] } }),
      Order.countDocuments({
        partner: partner._id,
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }),
      Food.countDocuments({ partner: partner._id }),
      Order.find({ partner: partner._id })
        .populate('user', 'name phone')
        .sort({ createdAt: -1 })
        .limit(5),
      Order.aggregate([
        { $match: { partner: partner._id } },
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
      ])
    ]);

    // Revenue for last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const revenueByDay = await Order.aggregate([
      {
        $match: {
          partner: partner._id,
          orderStatus: 'delivered',
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$pricing.total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalOrders,
          pendingOrders,
          todayOrders,
          totalFoods,
          totalRevenue: partner.totalRevenue,
          rating: partner.rating
        },
        recentOrders,
        ordersByStatus,
        revenueByDay
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};