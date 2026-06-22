const db = require('../config/db');

// Admin: Get all users
const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT id, name, email, phone, role, status, created_at FROM users WHERE role = "customer"';
    const params = [];
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY created_at DESC';
    const [users] = await db.query(query, params);
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Admin: Get user by ID
const getUserById = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, phone, role, status, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Admin: Toggle user status
const toggleUserStatus = async (req, res) => {
  try {
    const [users] = await db.query('SELECT status FROM users WHERE id = ?', [req.params.id]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });
    const newStatus = users[0].status === 'active' ? 'inactive' : 'active';
    await db.query('UPDATE users SET status = ? WHERE id = ?', [newStatus, req.params.id]);
    res.json({ success: true, message: `User ${newStatus}.` });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getAllUsers, getUserById, toggleUserStatus };
