// const Food = require('../models/Food');
// const Partner = require('../models/Partner');
// const Category = require('../models/Category');

// // @desc    Get all food items with filters
// // @route   GET /api/food
// exports.getAllFood = async (req, res) => {
//   try {
//     const {
//       search, category, partner, minPrice, maxPrice,
//       isVeg, isVegan, isGlutenFree, sortBy, page = 1, limit = 12,
//       featured
//     } = req.query;

//     const query = { isAvailable: true };

//     // Search
//     if (search) {
//       query.$text = { $search: search };
//     }

//     // Filters
//     if (category) query.category = category;
//     if (partner) query.partner = partner;
//     if (minPrice || maxPrice) {
//       query.price = {};
//       if (minPrice) query.price.$gte = Number(minPrice);
//       if (maxPrice) query.price.$lte = Number(maxPrice);
//     }
//     if (isVeg === 'true') query.isVeg = true;
//     if (isVegan === 'true') query.isVegan = true;
//     if (isGlutenFree === 'true') query.isGlutenFree = true;
//     if (featured === 'true') query.isFeatured = true;

//     // Sort
//     let sortOptions = {};
//     switch (sortBy) {
//       case 'price_asc': sortOptions = { price: 1 }; break;
//       case 'price_desc': sortOptions = { price: -1 }; break;
//       case 'rating': sortOptions = { 'rating.average': -1 }; break;
//       case 'popular': sortOptions = { totalOrders: -1 }; break;
//       default: sortOptions = { createdAt: -1 };
//     }

//     const skip = (Number(page) - 1) * Number(limit);
//     const total = await Food.countDocuments(query);
    
//     const foods = await Food.find(query)
//       .populate('category', 'name slug icon')
//       .populate('partner', 'shopName slug logo rating deliveryTime deliveryFee')
//       .sort(sortOptions)
//       .skip(skip)
//       .limit(Number(limit));

//     res.json({
//       success: true,
//       data: foods,
//       pagination: {
//         total,
//         page: Number(page),
//         pages: Math.ceil(total / Number(limit)),
//         limit: Number(limit)
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Get single food item
// // @route   GET /api/food/:id
// exports.getFoodById = async (req, res) => {
//   try {
//     const food = await Food.findById(req.params.id)
//       .populate('category', 'name slug icon')
//       .populate('partner', 'shopName slug logo rating deliveryTime deliveryFee isOpen')
//       .populate('reviews.user', 'name avatar');

//     if (!food) {
//       return res.status(404).json({ success: false, message: 'Food item not found' });
//     }

//     res.json({ success: true, data: food });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Create food item (Partner only)
// // @route   POST /api/food
// exports.createFood = async (req, res) => {
//   try {
//     const partner = await Partner.findOne({ user: req.user.id });
//     if (!partner) {
//       return res.status(404).json({ success: false, message: 'Partner profile not found' });
//     }
//     if (!partner.isApproved) {
//       return res.status(403).json({ success: false, message: 'Your shop is pending approval' });
//     }

//     const foodData = { ...req.body, partner: partner._id };
    
//     // Handle uploaded images
//     if (req.files && req.files.length > 0) {
//       foodData.images = req.files.map(file => ({
//         url: file.path || `/uploads/${file.filename}`,
//         public_id: file.filename
//       }));
//     }

//     const food = await Food.create(foodData);
//     await food.populate('category', 'name slug');

//     res.status(201).json({ success: true, data: food });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Update food item
// // @route   PUT /api/food/:id
// exports.updateFood = async (req, res) => {
//   try {
//     const partner = await Partner.findOne({ user: req.user.id });
//     let food = await Food.findById(req.params.id);

//     if (!food) {
//       return res.status(404).json({ success: false, message: 'Food item not found' });
//     }

//     // Check ownership (partner) or admin
//     if (req.user.role !== 'admin' && food.partner.toString() !== partner._id.toString()) {
//       return res.status(403).json({ success: false, message: 'Not authorized' });
//     }

//     if (req.files && req.files.length > 0) {
//       req.body.images = req.files.map(file => ({
//         url: file.path || `/uploads/${file.filename}`,
//         public_id: file.filename
//       }));
//     }

//     food = await Food.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true
//     }).populate('category', 'name slug');

//     res.json({ success: true, data: food });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Delete food item
// // @route   DELETE /api/food/:id
// exports.deleteFood = async (req, res) => {
//   try {
//     const partner = await Partner.findOne({ user: req.user.id });
//     const food = await Food.findById(req.params.id);

//     if (!food) {
//       return res.status(404).json({ success: false, message: 'Food item not found' });
//     }

//     if (req.user.role !== 'admin' && food.partner.toString() !== partner?._id?.toString()) {
//       return res.status(403).json({ success: false, message: 'Not authorized' });
//     }

//     await food.deleteOne();
//     res.json({ success: true, message: 'Food item deleted' });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Add review
// // @route   POST /api/food/:id/review
// exports.addReview = async (req, res) => {
//   try {
//     const { rating, comment } = req.body;
//     const food = await Food.findById(req.params.id);

//     if (!food) {
//       return res.status(404).json({ success: false, message: 'Food item not found' });
//     }

//     // Check if already reviewed
//     const alreadyReviewed = food.reviews.find(r => r.user.toString() === req.user.id);
//     if (alreadyReviewed) {
//       return res.status(400).json({ success: false, message: 'Already reviewed' });
//     }

//     food.reviews.push({ user: req.user.id, rating, comment });
    
//     // Recalculate average
//     const total = food.reviews.reduce((sum, r) => sum + r.rating, 0);
//     food.rating.average = total / food.reviews.length;
//     food.rating.count = food.reviews.length;

//     await food.save();
//     res.json({ success: true, data: food });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Get partner's food items
// // @route   GET /api/food/partner/:partnerId
// exports.getPartnerFood = async (req, res) => {
//   try {
//     const foods = await Food.find({ partner: req.params.partnerId })
//       .populate('category', 'name slug icon')
//       .sort({ createdAt: -1 });

//     res.json({ success: true, data: foods });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


const Food = require('../models/Food');
const Partner = require('../models/Partner');
const Category = require('../models/Category');

// @desc    Get all food items with filters
// @route   GET /api/food
exports.getAllFood = async (req, res) => {
  try {
    const {
      search, category, partner, minPrice, maxPrice,
      isVeg, isVegan, isGlutenFree, sortBy, page = 1, limit = 12,
      featured
    } = req.query;

    const query = { isAvailable: true };

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (category) query.category = category;
    if (partner) query.partner = partner;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (isVeg === 'true') query.isVeg = true;
    if (isVegan === 'true') query.isVegan = true;
    if (isGlutenFree === 'true') query.isGlutenFree = true;
    if (featured === 'true') query.isFeatured = true;

    // Sort
    let sortOptions = {};
    switch (sortBy) {
      case 'price_asc': sortOptions = { price: 1 }; break;
      case 'price_desc': sortOptions = { price: -1 }; break;
      case 'rating': sortOptions = { 'rating.average': -1 }; break;
      case 'popular': sortOptions = { totalOrders: -1 }; break;
      default: sortOptions = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Food.countDocuments(query);
    
    const foods = await Food.find(query)
      .populate('category', 'name slug icon')
      .populate('partner', 'shopName slug logo rating deliveryTime deliveryFee')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: foods,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single food item
// @route   GET /api/food/:id
exports.getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id)
      .populate('category', 'name slug icon')
      .populate('partner', 'shopName slug logo rating deliveryTime deliveryFee isOpen')
      .populate('reviews.user', 'name avatar');

    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    res.json({ success: true, data: food });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create food item (Partner only)
// @route   POST /api/food
exports.createFood = async (req, res) => {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner profile not found' });
    }
    if (!partner.isApproved) {
      return res.status(403).json({ success: false, message: 'Your shop is pending approval' });
    }

    const foodData = { ...req.body, partner: partner._id };
    
    // Handle uploaded images — always use /uploads/filename (never file.path which is an absolute OS path)
    if (req.files && req.files.length > 0) {
      foodData.images = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        public_id: file.filename
      }));
    }

    const food = await Food.create(foodData);
    await food.populate('category', 'name slug');

    res.status(201).json({ success: true, data: food });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update food item
// @route   PUT /api/food/:id
exports.updateFood = async (req, res) => {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    let food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    // Check ownership (partner) or admin
    if (req.user.role !== 'admin' && food.partner.toString() !== partner._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        public_id: file.filename
      }));
    }

    food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('category', 'name slug');

    res.json({ success: true, data: food });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete food item
// @route   DELETE /api/food/:id
exports.deleteFood = async (req, res) => {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    if (req.user.role !== 'admin' && food.partner.toString() !== partner?._id?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await food.deleteOne();
    res.json({ success: true, message: 'Food item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add review
// @route   POST /api/food/:id/review
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    // Check if already reviewed
    const alreadyReviewed = food.reviews.find(r => r.user.toString() === req.user.id);
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'Already reviewed' });
    }

    food.reviews.push({ user: req.user.id, rating, comment });
    
    // Recalculate average
    const total = food.reviews.reduce((sum, r) => sum + r.rating, 0);
    food.rating.average = total / food.reviews.length;
    food.rating.count = food.reviews.length;

    await food.save();
    res.json({ success: true, data: food });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get partner's food items
// @route   GET /api/food/partner/:partnerId
exports.getPartnerFood = async (req, res) => {
  try {
    const foods = await Food.find({ partner: req.params.partnerId })
      .populate('category', 'name slug icon')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: foods });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};