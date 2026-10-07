const pool = require('../config/db');

// Helper to get or create cart for user
const getOrCreateCartId = async (userId) => {
  const [existing] = await pool.query('SELECT id FROM cart WHERE user_id = ?', [userId]);
  if (existing.length > 0) {
    return existing[0].id;
  }
  const [result] = await pool.query('INSERT INTO cart (user_id) VALUES (?)', [userId]);
  return result.insertId;
};

// GET /api/cart
const getCart = async (req, res, next) => {
  try {
    const cartId = await getOrCreateCartId(req.user.id);

    const [items] = await pool.query(
      `SELECT 
        ci.id as cart_item_id,
        ci.quantity,
        p.id as product_id,
        p.name,
        p.slug,
        p.brand,
        p.price,
        p.original_price,
        p.discount,
        p.stock,
        p.status,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
      ORDER BY ci.created_at DESC`,
      [cartId]
    );

    // Calculate totals
    let originalTotal = 0;
    let subtotal = 0;

    const formattedItems = items.map(item => {
      const lineOriginal = parseFloat(item.original_price) * item.quantity;
      const lineSubtotal = parseFloat(item.price) * item.quantity;
      originalTotal += lineOriginal;
      subtotal += lineSubtotal;

      return {
        ...item,
        price: parseFloat(item.price),
        original_price: parseFloat(item.original_price),
        line_total: lineSubtotal
      };
    });

    const discount = Math.max(0, originalTotal - subtotal);
    // Free shipping threshold: ₹999
    const shippingThreshold = 999;
    const shipping = subtotal > 0 && subtotal < shippingThreshold ? 99 : 0;
    const total = subtotal + shipping;

    return res.status(200).json({
      success: true,
      items: formattedItems,
      summary: {
        originalTotal: parseFloat(originalTotal.toFixed(2)),
        subtotal: parseFloat(subtotal.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        shippingThreshold,
        amountForFreeShipping: Math.max(0, shippingThreshold - subtotal),
        shipping: parseFloat(shipping.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        itemCount: formattedItems.reduce((acc, curr) => acc + curr.quantity, 0)
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/cart (Add item to cart)
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const addQty = Math.max(1, parseInt(quantity));

    // Check product existence and stock
    const [products] = await pool.query(
      'SELECT id, name, price, stock, status FROM products WHERE id = ?',
      [productId]
    );

    if (products.length === 0 || products[0].status !== 'active') {
      return res.status(404).json({ success: false, message: 'Product is unavailable.' });
    }

    const product = products[0];

    if (product.stock <= 0) {
      return res.status(400).json({ success: false, message: 'Product is out of stock.' });
    }

    const cartId = await getOrCreateCartId(req.user.id);

    // Check if item already in cart
    const [existing] = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, productId]
    );

    if (existing.length > 0) {
      const newQty = existing[0].quantity + addQty;
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items are available.`
        });
      }

      await pool.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [newQty, existing[0].id]
      );
    } else {
      if (addQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items are available.`
        });
      }

      await pool.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
        [cartId, productId, addQty]
      );
    }

    return res.status(200).json({
      success: true,
      message: `${product.name} added to cart!`
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/cart/:itemId (Update item quantity)
const updateCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const cartId = await getOrCreateCartId(req.user.id);

    // Verify item belongs to user's cart
    const [items] = await pool.query(
      'SELECT ci.id, ci.product_id, p.stock, p.name FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.id = ? AND ci.cart_id = ?',
      [id, cartId]
    );

    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    const item = items[0];
    const newQty = parseInt(quantity);

    if (newQty <= 0) {
      // Remove item if quantity is zero or negative
      await pool.query('DELETE FROM cart_items WHERE id = ?', [id]);
      return res.status(200).json({ success: true, message: 'Item removed from cart.' });
    }

    if (newQty > item.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${item.stock} items are available.`
      });
    }

    await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, id]);

    return res.status(200).json({
      success: true,
      message: 'Cart updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/:itemId (Remove specific item)
const removeFromCart = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cartId = await getOrCreateCartId(req.user.id);

    const [result] = await pool.query(
      'DELETE FROM cart_items WHERE id = ? AND cart_id = ?',
      [id, cartId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart.'
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart (Clear user's entire cart)
const clearCart = async (req, res, next) => {
  try {
    const cartId = await getOrCreateCartId(req.user.id);
    await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};