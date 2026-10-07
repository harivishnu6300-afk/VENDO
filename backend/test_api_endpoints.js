const pool = require('./config/db');
const jwt = require('jsonwebtoken');

async function testHttpEndpoints() {
  console.log('--- TESTING HTTP ENDPOINT: DELETE /api/admin/users/:id ---');
  const baseUrl = 'http://localhost:5000/api';

  try {
    // 1. Fetch admin and a customer
    const [adminRows] = await pool.query('SELECT * FROM users WHERE role = "admin" LIMIT 1');
    const admin = adminRows[0];
    const adminToken = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET || 'vendo_fallback_secret', { expiresIn: '1h' });

    const [custRows] = await pool.query('SELECT * FROM users WHERE role = "customer" AND status = "active" LIMIT 1');
    const customer = custRows[0];
    const customerToken = jwt.sign({ id: customer.id, role: customer.role }, process.env.JWT_SECRET || 'vendo_fallback_secret', { expiresIn: '1h' });

    // 2. Test without token -> Expect 401
    const resNoToken = await fetch(`${baseUrl}/admin/users/999`, { method: 'DELETE' });
    const dataNoToken = await resNoToken.json();
    console.log('1. No token status:', resNoToken.status, 'message:', dataNoToken.message);
    if (resNoToken.status !== 401) throw new Error('Expected 401 for no token');

    // 3. Test with customer token -> Expect 403
    const resCust = await fetch(`${baseUrl}/admin/users/999`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    const dataCust = await resCust.json();
    console.log('2. Customer token status:', resCust.status, 'message:', dataCust.message);
    if (resCust.status !== 403) throw new Error('Expected 403 for customer token');

    // 4. Test admin deleting own account -> Expect 400
    const resSelf = await fetch(`${baseUrl}/admin/users/${admin.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const dataSelf = await resSelf.json();
    console.log('3. Self deletion status:', resSelf.status, 'message:', dataSelf.message);
    if (resSelf.status !== 400 || !dataSelf.message.includes('own admin account')) {
      throw new Error('Expected 400 self-deletion block');
    }

    // 5. Create a disposable test customer to delete
    const [insertRes] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, role, status) VALUES ("HTTP Delete Test", ?, "pass", "customer", "active")',
      [`http_del_${Date.now()}@example.com`]
    );
    const delTargetId = insertRes.insertId;
    console.log('Created customer ID', delTargetId, 'for HTTP delete test');

    // 6. Delete test customer as admin -> Expect 200
    const resDel = await fetch(`${baseUrl}/admin/users/${delTargetId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const dataDel = await resDel.json();
    console.log('4. Admin delete user status:', resDel.status, 'message:', dataDel.message);
    if (resDel.status !== 200 || !dataDel.success) {
      throw new Error('Expected 200 success on delete');
    }

    // 7. Verify user no longer in database
    const [verifyRows] = await pool.query('SELECT id FROM users WHERE id = ?', [delTargetId]);
    console.log('User in database after deletion:', verifyRows.length > 0 ? 'YES' : 'NO');
    if (verifyRows.length !== 0) throw new Error('User was not deleted from DB');

    console.log('🎉 ALL HTTP API SECURITY & FUNCTIONALITY TESTS PASSED!');
  } finally {
  }

  process.exit(0);
}

testHttpEndpoints().catch(err => {
  console.error('❌ HTTP test failed:', err);
  process.exit(1);
});