const pool = require('../config/db');

// GET /api/addresses
const getAddresses = async (req, res, next) => {
  try {
    const [addresses] = await pool.query(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      addresses
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/addresses
const createAddress = async (req, res, next) => {
  try {
    const { full_name, phone, address_line, city, state, pincode, is_default } = req.body;

    if (!full_name || !phone || !address_line || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'All address fields are required.'
      });
    }

    if (is_default) {
      await pool.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    }

    const [result] = await pool.query(
      `INSERT INTO addresses (user_id, full_name, phone, address_line, city, state, pincode, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        full_name.trim(),
        phone.trim(),
        address_line.trim(),
        city.trim(),
        state.trim(),
        pincode.trim(),
        is_default ? 1 : 0
      ]
    );

    const [created] = await pool.query('SELECT * FROM addresses WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'Address saved successfully.',
      address: created[0]
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/addresses/:id
const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [id, req.user.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Address deleted.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAddresses,
  createAddress,
  deleteAddress
};
