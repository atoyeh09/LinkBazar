const express = require('express');
const router = express.Router();
const {
  searchProducts,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/product.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.get('/search', searchProducts);
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected routes
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
