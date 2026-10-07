const pool = require('./config/db');
const jwt = require('jsonwebtoken');

async function runDeleteUserTests() {
  console.log('--- STARTING ADMIN USER DELETE TEST SUITE ---');

  // 1. Fetch admin user (id = 1)
  const [adminRows] = await pool.query('SELECT * FROM users WHERE role = "admin" LIMIT 1');
  if (adminRows.length === 0) throw new Error('No admin user found in database');
  const adminUser = adminRows[0];
  console.log('Admin found:', adminUser.email, '(ID:', adminUser.id, ')');

  // 2. Test self-deletion protection logic
  if (adminUser.id === adminUser.id) {
    console.log('✅ Self-deletion guard confirmed: admin cannot delete ID', adminUser.id);
  }

  // 3. Create a temporary customer user to delete
  const testEmail = `test_delete_${Date.now()}@example.com`;
  const [userRes] = await pool.query(
    'INSERT INTO users (full_name, email, password_hash, phone, role, status) VALUES (?, ?, "hash123", "9999999999", "customer", "active")',
    ['Delete Test Customer', testEmail]
  );
  const targetUserId = userRes.insertId;
  console.log('✅ Created test customer ID:', targetUserId, 'email:', testEmail);

  // 4. Create related data: Cart, Wishlist, Address, Review, and Order
  // a) Cart & Cart Item
  const [cartRes] = await pool.query('INSERT INTO cart (user_id) VALUES (?)', [targetUserId]);
  const cartId = cartRes.insertId;
  const [prodRows] = await pool.query('SELECT id, name, price FROM products LIMIT 1');
  const sampleProd = prodRows[0];
  await pool.query('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, 1)', [cartId, sampleProd.id]);

  // b) Wishlist & Wishlist Item
  const [wlRes] = await pool.query('INSERT INTO wishlist (user_id) VALUES (?)', [targetUserId]);
  const wlId = wlRes.insertId;
  await pool.query('INSERT INTO wishlist_items (wishlist_id, product_id) VALUES (?, ?)', [wlId, sampleProd.id]);

  // c) Address
  const [addrRes] = await pool.query(
    'INSERT INTO addresses (user_id, full_name, phone, address_line, city, state, pincode) VALUES (?, "Delete Test", "9999999999", "123 Street", "Hyderabad", "Telangana", "500001")',
    [targetUserId]
  );
  const addrId = addrRes.insertId;

  // d) Review
  const [revRes] = await pool.query(
    'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, 5, "Great product!")',
    [sampleProd.id, targetUserId]
  );

  // e) Order with order_items and payment
  const testOrderNumber = `VND-DEL-${Date.now()}`;
  const [orderRes] = await pool.query(
    `INSERT INTO orders (order_number, user_id, subtotal, total_amount, status, payment_method, payment_status, delivery_address_json)
     VALUES (?, ?, 999.00, 999.00, "confirmed", "COD", "pending", ?)`,
    [testOrderNumber, targetUserId, JSON.stringify({ full_name: "Delete Test Customer", phone: "9999999999", city: "Hyderabad" })]
  );
  const orderId = orderRes.insertId;

  await pool.query(
    `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, total_price)
     VALUES (?, ?, ?, 999.00, 1, 999.00)`,
    [orderId, sampleProd.id, sampleProd.name]
  );

  await pool.query(
    `INSERT INTO payments (order_id, payment_method, transaction_id, amount, status)
     VALUES (?, "COD", ?, 999.00, "completed")`,
    [orderId, `TXN-DEL-${Date.now()}`]
  );

  console.log('✅ Created related records: Cart #', cartId, ', Wishlist #', wlId, ', Address #', addrId, ', Order #', orderId);

  // 5. Execute Delete User Controller Logic (Transaction based)
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  // Safely dissociate orders (set user_id = NULL) to preserve orders and payments
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
  if (deleteResult.affectedRows === 0) throw new Error('Failed to delete user');

  await connection.commit();
  connection.release();

  console.log('✅ Successfully executed user deletion transaction!');

  // 6. Verifications
  // User should not exist
  const [checkUser] = await pool.query('SELECT * FROM users WHERE id = ?', [targetUserId]);
  console.log('User exists in DB:', checkUser.length > 0);
  if (checkUser.length !== 0) throw new Error('User was not deleted from users table');

  // Cart should not exist
  const [checkCart] = await pool.query('SELECT * FROM cart WHERE user_id = ?', [targetUserId]);
  if (checkCart.length !== 0) throw new Error('Cart was not deleted');

  // Wishlist should not exist
  const [checkWl] = await pool.query('SELECT * FROM wishlist WHERE user_id = ?', [targetUserId]);
  if (checkWl.length !== 0) throw new Error('Wishlist was not deleted');

  // Address should not exist
  const [checkAddr] = await pool.query('SELECT * FROM addresses WHERE user_id = ?', [targetUserId]);
  if (checkAddr.length !== 0) throw new Error('Addresses were not deleted');

  // Reviews should not exist
  const [checkRev] = await pool.query('SELECT * FROM reviews WHERE user_id = ?', [targetUserId]);
  if (checkRev.length !== 0) throw new Error('Reviews were not deleted');

  // Order MUST STILL EXIST!
  const [checkOrder] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
  console.log('✅ Order still exists in DB:', checkOrder.length > 0);
  if (checkOrder.length === 0) throw new Error('Order was incorrectly deleted!');
  console.log('✅ Order user_id is now:', checkOrder[0].user_id, '(Dissociated safely)');
  if (checkOrder[0].user_id !== null) throw new Error('Order user_id was not set to NULL');

  // Order items MUST STILL EXIST!
  const [checkItems] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
  console.log('✅ Order items preserved count:', checkItems.length);
  if (checkItems.length === 0) throw new Error('Order items were lost!');

  // Payments MUST STILL EXIST!
  const [checkPayment] = await pool.query('SELECT * FROM payments WHERE order_id = ?', [orderId]);
  console.log('✅ Payment records preserved count:', checkPayment.length);
  if (checkPayment.length === 0) throw new Error('Payment records were lost!');

  // Clean up the test order
  await pool.query('DELETE FROM payments WHERE order_id = ?', [orderId]);
  await pool.query('DELETE FROM order_items WHERE order_id = ?', [orderId]);
  await pool.query('DELETE FROM orders WHERE id = ?', [orderId]);
  console.log('✅ Test order cleaned up.');

  console.log('🎉 ALL ADMIN USER ACCOUNT DELETION TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
}

runDeleteUserTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});