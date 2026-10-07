const pool = require('../config/db');

// Helper to get or create wishlist for user
const getOrCreateWishlistId = async (userId) => {
  const [existing] = await pool.query('SELECT id FROM wishlist WHERE user_id = ?', [userId]);
  if (existing.length > 0) {
    return existing[0].id;
  }
  const [result] = await pool.query('INSERT INTO wishlist (user_id) VALUES (?)', [userId]);
  return result.insertId;
};

// GET /api/wishlist
const getWishlist = async (req, res, next) => {
  try {
    const wishlistId = await getOrCreateWishlistId(req.user.id);

    const [items] = await pool.query(
      `SELECT 
        wi.id as wishlist_item_id,
        wi.created_at as added_at,
        p.id as product_id,
        p.name,
        p.slug,
        p.brand,
        p.price,
        p.original_price,
        p.discount,
        p.stock,
        p.rating,
        p.review_count,
        c.name as category_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as image_url
      FROM wishlist_items wi
      JOIN products p ON wi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE wi.wishlist_id = ? AND p.status = 'active'
      ORDER BY wi.created_at DESC`,
      [wishlistId]
    );

    return res.status(200).json({
      success: true,
      items
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/wishlist (Toggle add/remove or add item)
const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const wishlistId = await getOrCreateWishlistId(req.user.id);

    // Check if product exists
    const [products] = await pool.query('SELECT id, name FROM products WHERE id = ?', [productId]);
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Check if already in wishlist
    const [existing] = await pool.query(
      'SELECT id FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?',
      [wishlistId, productId]
    );

    if (existing.length > 0) {
      // Remove
      await pool.query('DELETE FROM wishlist_items WHERE id = ?', [existing[0].id]);
      return res.status(200).json({
        success: true,
        isWishlisted: false,
        message: 'Removed from your Wishlist.'
      });
    } else {
      // Add
      await pool.query(
        'INSERT INTO wishlist_items (wishlist_id, product_id) VALUES (?, ?)',
        [wishlistId, productId]
      );
      return res.status(201).json({
        success: true,
        isWishlisted: true,
        message: 'Added to your Wishlist!'
      });
    }
  } catch (error) {
    next(error);
  }
};

// DELETE /api/wishlist/:productId
const removeFromWishlist = async (req, res, next) => {
  try {
    const { id } = req.params; // Product ID or Wishlist Item ID
    const wishlistId = await getOrCreateWishlistId(req.user.id);

    await pool.query(
      'DELETE FROM wishlist_items WHERE wishlist_id = ? AND (product_id = ? OR id = ?)',
      [wishlistId, id, id]
    );

    return res.status(200).json({
      success: true,
      message: 'Item removed from Wishlist.'
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/wishlist/:productId/move-to-cart
const moveToCart = async (req, res, next) => {
  try {
    const { id } = req.params; // product_id
    const userId = req.user.id;
    const wishlistId = await getOrCreateWishlistId(userId);

    // Check product stock
    const [products] = await pool.query('SELECT id, name, stock FROM products WHERE id = ?', [id]);
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    if (products[0].stock <= 0) {
      return res.status(400).json({ success: false, message: 'Product is currently out of stock.' });
    }

    // Get or create cart
    const [cartRows] = await pool.query('SELECT id FROM cart WHERE user_id = ?', [userId]);
    let cartId = cartRows[0]?.id;
    if (!cartId) {
      const [newCart] = await pool.query('INSERT INTO cart (user_id) VALUES (?)', [userId]);
      cartId = newCart.insertId;
    }

    // Add or increment in cart
    const [cartItem] = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, id]
    );

    if (cartItem.length > 0) {
      if (cartItem[0].quantity + 1 > products[0].stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${products[0].stock} items are available.`
        });
      }
      await pool.query('UPDATE cart_items SET quantity = quantity + 1 WHERE id = ?', [cartItem[0].id]);
    } else {
      await pool.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, 1)',
        [cartId, id]
      );
    }

    // Remove from wishlist
    await pool.query(
      'DELETE FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?',
      [wishlistId, id]
    );

    return res.status(200).json({
      success: true,
      message: `${products[0].name} moved to Cart!`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
  moveToCart
};
