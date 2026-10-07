const pool = require('../config/db');

// GET /api/coupons/validate?code=XYZ&amount=1000
const validateCoupon = async (req, res, next) => {
  try {
    const { code, amount } = req.query;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required.' });
    }

    const orderAmount = parseFloat(amount || 0);

    const [coupons] = await pool.query(
      'SELECT * FROM coupons WHERE code = ? AND is_active = 1',
      [code.trim().toUpperCase()]
    );

    if (coupons.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or inactive coupon code.'
      });
    }

    const coupon = coupons[0];

    // Check expiry
    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has expired.'
      });
    }

    // Check minimum order amount
    if (orderAmount < parseFloat(coupon.min_order_amount)) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum order of ₹${coupon.min_order_amount}.`
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (orderAmount * parseFloat(coupon.discount_value)) / 100;
      if (coupon.max_discount_amount) {
        discount = Math.min(discount, parseFloat(coupon.max_discount_amount));
      }
    } else {
      discount = Math.min(orderAmount, parseFloat(coupon.discount_value));
    }

    return res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" applied successfully!`,
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: parseFloat(discount.toFixed(2))
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateCoupon
};
