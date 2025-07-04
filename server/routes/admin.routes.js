const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  deleteClassified,
  deleteProduct
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Protected admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.delete('/classifieds/:id', deleteClassified);
router.delete('/products/:id', deleteProduct);

module.exports = router;
