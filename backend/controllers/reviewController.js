const pool = require('../config/db');

// GET /api/products/:id/reviews
const getProductReviews = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [reviews] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.full_name as user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/products/:id/reviews
const addReview = async (req, res, next) => {
  try {
    const { id } = req.params; // product_id
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.'
      });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Review comment cannot be empty.'
      });
    }

    // Check if product exists
    const [products] = await pool.query('SELECT id FROM products WHERE id = ?', [id]);
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Check if user already reviewed
    const [existing] = await pool.query(
      'SELECT id FROM reviews WHERE product_id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length > 0) {
      // Update existing review
      await pool.query(
        'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?',
        [parseInt(rating), comment.trim(), existing[0].id]
      );
    } else {
      // Insert new review
      await pool.query(
        'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
        [id, userId, parseInt(rating), comment.trim()]
      );
    }

    // Recalculate average rating and count for product
    const [[stats]] = await pool.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE product_id = ?',
      [id]
    );

    const newAvg = parseFloat(stats.avg_rating || 0).toFixed(2);
    const newCount = parseInt(stats.review_count || 0);

    await pool.query(
      'UPDATE products SET rating = ?, review_count = ? WHERE id = ?',
      [newAvg, newCount, id]
    );

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been submitted.',
      rating: parseFloat(newAvg),
      reviewCount: newCount
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductReviews,
  addReview
};
