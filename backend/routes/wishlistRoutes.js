const express = require('express');
const router = express.Router();
const {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
  moveToCart
} = require('../controllers/wishlistController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', getWishlist);
router.post('/', toggleWishlist);
router.delete('/:id', removeFromWishlist);
router.post('/:id/move-to-cart', moveToCart);

module.exports = router;
