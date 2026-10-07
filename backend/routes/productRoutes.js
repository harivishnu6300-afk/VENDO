const express = require('express');
const router = express.Router();
const {
  getProducts,
  getFilterMeta,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { getProductReviews, addReview } = require('../controllers/reviewController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/filters/meta', getFilterMeta);
router.get('/:id', getProductById);
router.post('/', authenticateToken, requireAdmin, createProduct);
router.put('/:id', authenticateToken, requireAdmin, updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);

// Nested reviews endpoints
router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', authenticateToken, addReview);

module.exports = router;
