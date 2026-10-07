const pool = require('../config/db');

// Helper to generate slug
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// GET /api/categories
const getCategories = async (req, res, next) => {
  try {
    const [categories] = await pool.query(`
      SELECT 
        c.id, c.name, c.slug, c.description, c.image_url, c.created_at,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      GROUP BY c.id
      ORDER BY c.name ASC
    `);

    return res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/categories (Admin)
const createCategory = async (req, res, next) => {
  try {
    const { name, description, image_url } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.'
      });
    }

    const trimmedName = name.trim();
    const slug = generateSlug(trimmedName);

    const [existing] = await pool.query('SELECT id FROM categories WHERE name = ? OR slug = ?', [trimmedName, slug]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A category with this name already exists.'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)',
      [trimmedName, slug, description || null, image_url || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category: {
        id: result.insertId,
        name: trimmedName,
        slug,
        description,
        image_url
      }
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/categories/:id (Admin)
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, image_url } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.'
      });
    }

    const trimmedName = name.trim();
    const slug = generateSlug(trimmedName);

    const [existing] = await pool.query(
      'SELECT id FROM categories WHERE (name = ? OR slug = ?) AND id != ?',
      [trimmedName, slug, id]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Another category with this name already exists.'
      });
    }

    const [result] = await pool.query(
      'UPDATE categories SET name = ?, slug = ?, description = ?, image_url = ? WHERE id = ?',
      [trimmedName, slug, description || null, image_url || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/categories/:id (Admin)
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if category has products
    const [products] = await pool.query('SELECT id FROM products WHERE category_id = ?', [id]);
    if (products.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category because it has ${products.length} associated product(s). Reassign them first.`
      });
    }

    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};