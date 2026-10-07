const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'vendo_fallback_secret',
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { full_name, email, phone, password, confirmPassword } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required.'
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
      [full_name.trim(), normalizedEmail, password_hash, phone ? phone.trim() : null, 'customer']
    );

    const userId = result.insertId;

    // Create user's cart and wishlist
    await pool.query('INSERT IGNORE INTO cart (user_id) VALUES (?)', [userId]);
    await pool.query('INSERT IGNORE INTO wishlist (user_id) VALUES (?)', [userId]);

    const user = {
      id: userId,
      full_name: full_name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : null,
      role: 'customer'
    };

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to VENDO.',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const [rows] = await pool.query(
      'SELECT id, full_name, email, password_hash, phone, role, status FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = rows[0];

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact customer support.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Ensure cart and wishlist exist
    await pool.query('INSERT IGNORE INTO cart (user_id) VALUES (?)', [user.id]);
    await pool.query('INSERT IGNORE INTO wishlist (user_id) VALUES (?)', [user.id]);

    const userObj = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role
    };

    const token = generateToken(userObj);

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: userObj
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, full_name, email, phone, role, status, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    return res.status(200).json({
      success: true,
      user: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { full_name, phone } = req.body;

    if (!full_name) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required.'
      });
    }

    await pool.query(
      'UPDATE users SET full_name = ?, phone = ? WHERE id = ?',
      [full_name.trim(), phone ? phone.trim() : null, req.user.id]
    );

    const [rows] = await pool.query(
      'SELECT id, full_name, email, phone, role, status FROM users WHERE id = ?',
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.'
      });
    }

    const [rows] = await pool.query(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
};