// const express = require('express');
// const router = express.Router();
// const {
//   getDashboard, getUsers, toggleUserBlock,
//   approvePartner, getAllOrders, createCategory,
//   updateCategory, deleteCategory
// } = require('../controllers/adminController');
// const { protect, authorize } = require('../middleware/auth');

// router.use(protect, authorize('admin'));

// router.get('/dashboard', getDashboard);
// router.get('/users', getUsers);
// router.put('/users/:id/toggle-block', toggleUserBlock);
// router.put('/partners/:id/approve', approvePartner);
// router.get('/orders', getAllOrders);
// router.post('/categories', createCategory);
// router.put('/categories/:id', updateCategory);
// router.delete('/categories/:id', deleteCategory);

// module.exports = router;


const express = require('express');
const router = express.Router();
const {
  getDashboard, getUsers, toggleUserBlock,
  approvePartner, getAllOrders, createCategory,
  updateCategory, deleteCategory, getAllPartners
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.put('/users/:id/toggle-block', toggleUserBlock);
router.get('/partners', getAllPartners);
router.put('/partners/:id/approve', approvePartner);
router.get('/orders', getAllOrders);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router;