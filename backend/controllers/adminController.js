const pool = require('../config/db');

// GET /api/admin/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total counts
    const [[{ totalProducts }]] = await pool.query('SELECT COUNT(*) as totalProducts FROM products');
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) as totalUsers FROM users WHERE role = "customer"');
    const [[{ totalOrders }]] = await pool.query('SELECT COUNT(*) as totalOrders FROM orders');
    const [[{ totalRevenue }]] = await pool.query('SELECT COALESCE(SUM(total_amount), 0) as totalRevenue FROM orders WHERE status != "cancelled"');
    const [[{ pendingOrders }]] = await pool.query('SELECT COUNT(*) as pendingOrders FROM orders WHERE status IN ("pending", "confirmed")');
    const [[{ lowStockCount }]] = await pool.query('SELECT COUNT(*) as lowStockCount FROM products WHERE stock <= 5 AND status = "active"');

    // 2. Low stock products list
    const [lowStockProducts] = await pool.query(
      `SELECT id, name, stock, price, 
        (SELECT image_url FROM product_images WHERE product_id = products.id ORDER BY is_primary DESC LIMIT 1) as image_url
       FROM products 
       WHERE stock <= 5 AND status = "active" 
       ORDER BY stock ASC 
       LIMIT 6`
    );

    // 3. Category distribution
    const [categoryDistribution] = await pool.query(`
      SELECT c.name, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      GROUP BY c.id
      ORDER BY product_count DESC
    `);

    // 4. Order status distribution
    const [orderStatuses] = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM orders 
      GROUP BY status
    `);

    // 5. Recent orders
    const [recentOrders] = await pool.query(`
      SELECT 
        o.id, o.order_number, o.total_amount, o.status, o.payment_method, o.created_at,
        COALESCE(u.full_name, 'Deleted User') as customer_name,
        COALESCE(u.email, 'N/A') as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 6
    `);

    // 6. Recent daily sales (last 7 days)
    const [salesTrend] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m-%d') as date,
        COUNT(*) as order_count,
        SUM(total_amount) as daily_revenue
      FROM orders
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND status != 'cancelled'
      GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
      ORDER BY date ASC
    `);

    return res.status(200).json({
      success: true,
      stats: {
        totalProducts: parseInt(totalProducts),
        totalUsers: parseInt(totalUsers),
        totalOrders: parseInt(totalOrders),
        totalRevenue: parseFloat(totalRevenue),
        pendingOrders: parseInt(pendingOrders),
        lowStockCount: parseInt(lowStockCount)
      },
      lowStockProducts,
      categoryDistribution,
      orderStatuses,
      recentOrders,
      salesTrend
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/orders
const getAllOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 15 } = req.query;
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const params = [];
    const countParams = [];
    let whereClauses = [];

    if (status && status !== 'all') {
      whereClauses.push('o.status = ?');
      params.push(status);
      countParams.push(status);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      whereClauses.push('(o.order_number LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)');
      params.push(term, term, term);
      countParams.push(term, term, term);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM orders o LEFT JOIN users u ON o.user_id = u.id ${whereSQL}`,
      countParams
    );

    const [orders] = await pool.query(
      `SELECT 
        o.id, o.order_number, o.subtotal, o.discount, o.shipping, o.total_amount,
        o.coupon_code, o.status, o.payment_method, o.payment_status, o.created_at,
        o.delivery_address_json,
        o.user_id,
        COALESCE(u.full_name, 'Deleted User') as customer_name,
        COALESCE(u.email, 'N/A') as customer_email,
        COALESCE(u.phone, 'N/A') as customer_phone
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ${whereSQL}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    // Parse addresses and fetch items
    for (const order of orders) {
      if (typeof order.delivery_address_json === 'string') {
        try {
          order.delivery_address = JSON.parse(order.delivery_address_json);
        } catch (e) {
          order.delivery_address = {};
        }
      } else {
        order.delivery_address = order.delivery_address_json;
      }

      if (!order.customer_name || order.customer_name === 'Deleted User') {
        order.customer_name = order.delivery_address?.full_name || 'Deleted User';
      }

      const [items] = await pool.query(
        'SELECT id, product_id, product_name, price, quantity, total_price, image_url FROM order_items WHERE order_id = ?',
        [order.id]
      );
      order.items = items;
    }

    return res.status(200).json({
      success: true,
      orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const [rows] = await connection.query('SELECT id, status FROM orders WHERE id = ?', [id]);
    if (rows.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const prevStatus = rows[0].status;

    await connection.beginTransaction();

    // If changing to 'cancelled' from an active status, restore stock
    if (status === 'cancelled' && prevStatus !== 'cancelled') {
      const [items] = await connection.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [id]
      );

      for (const item of items) {
        if (item.product_id) {
          await connection.query(
            'UPDATE products SET stock = stock + ? WHERE id = ?',
            [item.quantity, item.product_id]
          );
        }
      }
    }

    await connection.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    await connection.commit();
    connection.release();

    return res.status(200).json({
      success: true,
      message: `Order status updated to "${status}".`
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    next(error);
  }
};

// GET /api/admin/users
const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const params = [];
    const countParams = [];
    let whereClauses = [];

    if (role && role !== 'all') {
      whereClauses.push('u.role = ?');
      params.push(role);
      countParams.push(role);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      whereClauses.push('(u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
      params.push(term, term, term);
      countParams.push(term, term, term);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM users u ${whereSQL}`,
      countParams
    );

    const [users] = await pool.query(
      `SELECT 
        u.id, u.full_name, u.email, u.phone, u.role, u.status, u.created_at,
        COUNT(o.id) as order_count,
        COALESCE(SUM(o.total_amount), 0) as total_spent
       FROM users u
       LEFT JOIN orders o ON u.id = o.user_id AND o.status != 'cancelled'
       ${whereSQL}
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/users/:id/status
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, role } = req.body;

    const [users] = await pool.query('SELECT id, role FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Prevent deactivating own account
    if (parseInt(id) === req.user.id && status === 'inactive') {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own admin account.'
      });
    }

    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (role) {
      updates.push('role = ?');
      params.push(role);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No update parameters provided.' });
    }

    params.push(id);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

    return res.status(200).json({
      success: true,
      message: 'User details updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Coupons Management
const getCoupons = async (req, res, next) => {
  try {
    const [coupons] = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
    return res.status(200).json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

const createCoupon = async (req, res, next) => {
  try {
    const { code, discount_type = 'percentage', discount_value, min_order_amount = 0, max_discount_amount, valid_until } = req.body;

    if (!code || !discount_value) {
      return res.status(400).json({ success: false, message: 'Coupon code and discount value are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount_amount, valid_until)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        code.trim().toUpperCase(),
        discount_type,
        parseFloat(discount_value),
        parseFloat(min_order_amount) || 0,
        max_discount_amount ? parseFloat(max_discount_amount) : null,
        valid_until || null
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Coupon created successfully.',
      couponId: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM coupons WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const targetUserId = parseInt(id);

    // 1. Mandatory backend authorization: administrator role check
    if (!req.user || req.user.role !== 'admin') {
      connection.release();
      return res.status(403).json({
        success: false,
        message: 'Access denied. Administrator privileges required.'
      });
    }

    // 2. Protect admin from deleting own account
    if (targetUserId === req.user.id) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account.'
      });
    }

    // 3. Verify user existence
    const [users] = await connection.query('SELECT id, full_name, email, role FROM users WHERE id = ?', [targetUserId]);
    if (users.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const targetUser = users[0];

    // Protect all admin accounts
    if (targetUser.role === 'admin') {
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'Admin accounts cannot be deleted.'
      });
    }

    // 4. Begin transaction for safe relationship handling
    await connection.beginTransaction();

    // Preserve orders: dissociate order records (set user_id = NULL) to protect financial & sales history
    await connection.query('UPDATE orders SET user_id = NULL WHERE user_id = ?', [targetUserId]);

    // Clean up cart & cart items
    const [userCart] = await connection.query('SELECT id FROM cart WHERE user_id = ?', [targetUserId]);
    if (userCart.length > 0) {
      await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [userCart[0].id]);
      await connection.query('DELETE FROM cart WHERE id = ?', [userCart[0].id]);
    }

    // Clean up wishlist & wishlist items
    const [userWishlist] = await connection.query('SELECT id FROM wishlist WHERE user_id = ?', [targetUserId]);
    if (userWishlist.length > 0) {
      await connection.query('DELETE FROM wishlist_items WHERE wishlist_id = ?', [userWishlist[0].id]);
      await connection.query('DELETE FROM wishlist WHERE id = ?', [userWishlist[0].id]);
    }

    // Clean up addresses
    await connection.query('DELETE FROM addresses WHERE user_id = ?', [targetUserId]);

    // Clean up reviews
    await connection.query('DELETE FROM reviews WHERE user_id = ?', [targetUserId]);

    // Delete user from users table
    const [deleteResult] = await connection.query('DELETE FROM users WHERE id = ?', [targetUserId]);

    if (deleteResult.affectedRows === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'User not found or already deleted.'
      });
    }

    await connection.commit();
    connection.release();

    return res.status(200).json({
      success: true,
      message: `User "${targetUser.full_name}" deleted successfully.`
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getCoupons,
  createCoupon,
  deleteCoupon
};