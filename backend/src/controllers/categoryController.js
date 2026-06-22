const db = require('../config/db');

// Get all categories
const getCategories = async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories WHERE status = "active" ORDER BY name');
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Admin: Get all categories
const getAllCategories = async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories ORDER BY name');
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Create category
const createCategory = async (req, res) => {
  try {
    const { name, status } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required.' });
    const [result] = await db.query('INSERT INTO categories (name, status) VALUES (?, ?)', [name, status || 'active']);
    res.status(201).json({ success: true, message: 'Category created.', categoryId: result.insertId });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { name, status } = req.body;
    await db.query('UPDATE categories SET name = ?, status = ? WHERE id = ?', [name, status, req.params.id]);
    res.json({ success: true, message: 'Category updated.' });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Category deleted.' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getCategories, getAllCategories, createCategory, updateCategory, deleteCategory };
