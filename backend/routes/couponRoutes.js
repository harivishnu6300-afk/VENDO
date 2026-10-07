const express = require('express');
const router = express.Router();
const { validateCoupon } = require('../controllers/couponController');
const { authenticateToken } = require('../middleware/auth');

// Validation requires authentication (optional or required)
router.get('/validate', authenticateToken, validateCoupon);

module.exports = router;
