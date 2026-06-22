const db = require('../config/db');

// Get cart items
const getCart = async (req, res) => {
  try {
    const [items] = await db.query(
      `SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.image, p.stock
       FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = ?`,
      [req.user.id]
    );
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    res.json({ success: true, items, total });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Add to cart
const addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    // Check product exists and has stock
    const [products] = await db.query('SELECT * FROM products WHERE id = ? AND status = "active"', [product_id]);
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    if (products[0].stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock.' });
    }
    // Insert or update
    await db.query(
      'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?',
      [req.user.id, product_id, quantity, quantity]
    );
    res.json({ success: true, message: 'Product added to cart.' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) {
      await db.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
      return res.json({ success: true, message: 'Item removed from cart.' });
    }
    await db.query('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, req.params.id, req.user.id]);
    res.json({ success: true, message: 'Cart updated.' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Remove from cart
const removeFromCart = async (req, res) => {
  try {
    await db.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Item removed from cart.' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    await db.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
