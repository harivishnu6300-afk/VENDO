const pool = require('../config/db');

// Helper to generate VND order number
const generateOrderNumber = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `VND-${randomNum}`;
};

// POST /api/orders (Create order)
const createOrder = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user.id;
    const {
      addressId,
      shippingAddress, // { full_name, phone, address_line, city, state, pincode }
      paymentMethod = 'COD',
      couponCode
    } = req.body;

    // Validate payment method
    const validMethods = ['COD', 'UPI', 'CARD'];
    if (!validMethods.includes(paymentMethod)) {
      connection.release();
      return res.status(400).json({ success: false, message: 'Invalid payment method.' });
    }

    // Determine final shipping address
    let deliveryAddress = null;
    let savedAddressId = addressId || null;

    if (addressId) {
      const [addrRows] = await connection.query(
        'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
        [addressId, userId]
      );
      if (addrRows.length > 0) {
        deliveryAddress = addrRows[0];
      }
    }

    if (!deliveryAddress && shippingAddress) {
      const { full_name, phone, address_line, city, state, pincode, saveAddress } = shippingAddress;
      if (!full_name || !phone || !address_line || !city || !state || !pincode) {
        connection.release();
        return res.status(400).json({
          success: false,
          message: 'All address fields (Full Name, Phone, Address, City, State, Pincode) are required.'
        });
      }
      deliveryAddress = { full_name, phone, address_line, city, state, pincode };

      if (saveAddress) {
        const [newAddr] = await connection.query(
          'INSERT INTO addresses (user_id, full_name, phone, address_line, city, state, pincode) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [userId, full_name, phone, address_line, city, state, pincode]
        );
        savedAddressId = newAddr.insertId;
      }
    }

    if (!deliveryAddress) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required to place an order.'
      });
    }

    // Fetch user's cart items
    const [cartRows] = await connection.query('SELECT id FROM cart WHERE user_id = ?', [userId]);
    if (cartRows.length === 0) {
      connection.release();
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    const cartId = cartRows[0].id;
    const [cartItems] = await connection.query(
      `SELECT 
        ci.id as cart_item_id, ci.product_id, ci.quantity,
        p.name, p.price, p.stock, p.status,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?`,
      [cartId]
    );

    if (cartItems.length === 0) {
      connection.release();
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    // Begin Transaction
    await connection.beginTransaction();

    let subtotal = 0;
    const verifiedItems = [];

    // Lock and check stock for every item atomically
    for (const item of cartItems) {
      // Lock product row with FOR UPDATE to prevent race conditions
      const [productRows] = await connection.query(
        'SELECT id, name, price, stock, status FROM products WHERE id = ? FOR UPDATE',
        [item.product_id]
      );

      if (productRows.length === 0 || productRows[0].status !== 'active') {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          success: false,
          message: `Product "${item.name}" is no longer available.`
        });
      }

      const currentProduct = productRows[0];
      const availableStock = currentProduct.stock;

      // Validate available stock against requested quantity
      if (availableStock < item.quantity) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          success: false,
          message: `Only ${availableStock} items are available.`
        });
      }

      subtotal += parseFloat(currentProduct.price) * item.quantity;
      verifiedItems.push({
        ...item,
        price: currentProduct.price,
        currentStock: availableStock
      });
    }

    // Coupon discount logic
    let couponDiscount = 0;
    let appliedCoupon = null;

    if (couponCode && couponCode.trim()) {
      const [coupons] = await connection.query(
        'SELECT * FROM coupons WHERE code = ? AND is_active = 1',
        [couponCode.trim().toUpperCase()]
      );

      if (coupons.length > 0) {
        const c = coupons[0];
        const isNotExpired = !c.valid_until || new Date(c.valid_until) >= new Date();
        const meetsMin = subtotal >= parseFloat(c.min_order_amount);

        if (isNotExpired && meetsMin) {
          appliedCoupon = c.code;
          if (c.discount_type === 'percentage') {
            let discountAmt = (subtotal * parseFloat(c.discount_value)) / 100;
            if (c.max_discount_amount) {
              discountAmt = Math.min(discountAmt, parseFloat(c.max_discount_amount));
            }
            couponDiscount = discountAmt;
          } else {
            couponDiscount = parseFloat(c.discount_value);
          }
        }
      }
    }

    const shipping = subtotal >= 999 ? 0 : 99;
    const totalAmount = Math.max(0, subtotal - couponDiscount + shipping);

    const orderNumber = generateOrderNumber();
    const paymentStatus = paymentMethod === 'COD' ? 'pending' : 'paid';

    // Insert order
    const [orderResult] = await connection.query(
      `INSERT INTO orders 
        (order_number, user_id, subtotal, discount, shipping, total_amount, coupon_code, status, payment_method, payment_status, delivery_address_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, ?)`,
      [
        orderNumber,
        userId,
        subtotal.toFixed(2),
        couponDiscount.toFixed(2),
        shipping.toFixed(2),
        totalAmount.toFixed(2),
        appliedCoupon,
        paymentMethod,
        paymentStatus,
        JSON.stringify(deliveryAddress)
      ]
    );

    const orderId = orderResult.insertId;

    // Insert order items and deduct stock atomically
    for (const item of verifiedItems) {
      const itemTotal = parseFloat(item.price) * item.quantity;

      await connection.query(
        `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, total_price, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.name,
          parseFloat(item.price),
          item.quantity,
          itemTotal.toFixed(2),
          item.image_url || null
        ]
      );

      // Decrement stock atomically ensuring it does not drop below 0
      const [updateResult] = await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
        [item.quantity, item.product_id, item.quantity]
      );

      if (updateResult.affectedRows === 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          success: false,
          message: `Only ${item.currentStock} items are available.`
        });
      }
    }

    // Insert payment record
    const transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    await connection.query(
      `INSERT INTO payments (order_id, payment_method, transaction_id, amount, status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        orderId,
        paymentMethod,
        transactionId,
        totalAmount.toFixed(2),
        paymentMethod === 'COD' ? 'pending' : 'completed'
      ]
    );

    // Clear user cart items
    await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

    // Commit Transaction
    await connection.commit();
    connection.release();

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: {
        id: orderId,
        order_number: orderNumber,
        total_amount: totalAmount.toFixed(2),
        subtotal: subtotal.toFixed(2),
        discount: couponDiscount.toFixed(2),
        shipping: shipping.toFixed(2),
        payment_method: paymentMethod,
        status: 'confirmed',
        created_at: new Date()
      }
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    next(error);
  }
};

// GET /api/orders (User's orders)
const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [orders] = await pool.query(
      `SELECT 
        o.id, o.order_number, o.subtotal, o.discount, o.shipping, o.total_amount,
        o.coupon_code, o.status, o.payment_method, o.payment_status, o.created_at,
        o.delivery_address_json
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC`,
      [userId]
    );

    // Attach items to each order
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

      const [items] = await pool.query(
        'SELECT id, product_id, product_name, price, quantity, total_price, image_url FROM order_items WHERE order_id = ?',
        [order.id]
      );
      order.items = items;
    }

    return res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id (Single order details)
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const query = isAdmin
      ? 'SELECT * FROM orders WHERE id = ? OR order_number = ?'
      : 'SELECT * FROM orders WHERE (id = ? OR order_number = ?) AND user_id = ?';

    const params = isAdmin ? [id, id] : [id, id, userId];

    const [rows] = await pool.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = rows[0];
    if (typeof order.delivery_address_json === 'string') {
      try {
        order.delivery_address = JSON.parse(order.delivery_address_json);
      } catch (e) {
        order.delivery_address = {};
      }
    } else {
      order.delivery_address = order.delivery_address_json;
    }

    // Fetch items
    const [items] = await pool.query(
      'SELECT id, product_id, product_name, price, quantity, total_price, image_url FROM order_items WHERE order_id = ?',
      [order.id]
    );
    order.items = items;

    // Fetch payment record
    const [payment] = await pool.query('SELECT * FROM payments WHERE order_id = ?', [order.id]);
    order.payment = payment[0] || null;

    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById
};
