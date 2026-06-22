const db = require('../config/db');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };
    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order.' });
  }
};

// Verify payment and create order
const verifyPaymentAndCreateOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cart_items,
      total_amount,
      shipping_charge,
      full_name,
      phone,
      address_line1,
      address_line2,
      city,
      pincode,
      lat,
      lng
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed.' });
    }

    // Generate unique order number
    const orderNumber = 'ORD' + Date.now();

    // Create order
    const [orderResult] = await db.query(
      `INSERT INTO orders 
       (order_number, user_id, total_amount, shipping_charge, payment_status, payment_id, razorpay_order_id, razorpay_signature, full_name, phone, address_line1, address_line2, city, pincode, lat, lng, status, payment_method)
       VALUES (?, ?, ?, ?, 'paid', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', 'Online')`,
      [orderNumber, req.user.id, total_amount, shipping_charge || 49, razorpay_payment_id, razorpay_order_id, razorpay_signature, full_name, phone, address_line1, address_line2 || null, city, pincode, lat || null, lng || null]
    );

    const orderId = orderResult.insertId;

    // Create order items
    for (const item of cart_items) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.name, item.quantity, item.price]
      );
      // Reduce stock
      await db.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    // Clear cart
    await db.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

    res.json({
      success: true,
      message: 'Order placed successfully.',
      orderId,
      orderNumber,
      total_amount,
      payment_method: 'Online',
      payment_status: 'paid',
      status: 'confirmed'
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Create Cash on Delivery order
const createCodOrder = async (req, res) => {
  try {
    const {
      cart_items,
      total_amount,
      shipping_charge,
      full_name,
      phone,
      address_line1,
      address_line2,
      city,
      pincode,
      lat,
      lng
    } = req.body;

    // Generate unique order number
    const orderNumber = 'ORD' + Date.now();

    // Create order (payment_status is 'pending' for COD)
    const [orderResult] = await db.query(
      `INSERT INTO orders 
       (order_number, user_id, total_amount, shipping_charge, payment_status, payment_id, full_name, phone, address_line1, address_line2, city, pincode, lat, lng, status, payment_method)
       VALUES (?, ?, ?, ?, 'pending', 'COD_PENDING', ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'COD')`,
      [orderNumber, req.user.id, total_amount, shipping_charge || 49, full_name, phone, address_line1, address_line2 || null, city, pincode, lat || null, lng || null]
    );

    const orderId = orderResult.insertId;

    // Create order items
    for (const item of cart_items) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.name, item.quantity, item.price]
      );
      // Reduce stock
      await db.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    // Clear cart
    await db.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

    res.json({
      success: true,
      message: 'COD Order placed successfully.',
      orderId,
      orderNumber,
      total_amount,
      payment_method: 'COD',
      payment_status: 'pending',
      status: 'pending'
    });
  } catch (error) {
    console.error('Create COD order error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get my orders (customer)
const getMyOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    for (const order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.image, 
                (SELECT COUNT(*) FROM reviews r WHERE r.user_id = ? AND r.product_id = oi.product_id AND r.order_id = oi.order_id) as is_reviewed
         FROM order_items oi 
         LEFT JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [req.user.id, order.id]
      );
      order.items = items;
    }
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get single order
const getOrder = async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT o.*, u.name as user_name, u.email as user_email, u.phone as user_phone FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?',
      [req.params.id]
    );
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    const order = orders[0];
    // Check access: customer can only see their own orders
    if (req.user.role === 'customer' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    const [items] = await db.query(
      `SELECT oi.*, p.image, 
              (SELECT COUNT(*) FROM reviews r WHERE r.user_id = ? AND r.product_id = oi.product_id AND r.order_id = oi.order_id) as is_reviewed
       FROM order_items oi 
       LEFT JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [req.user.id, order.id]
    );
    order.items = items;
    
    // Construct delivery address and payment method
    order.payment_method = order.payment_method || 'Online';
    order.delivery_address = {
      name: order.full_name,
      phone: order.phone,
      street: order.address_line2 ? `${order.address_line1}, ${order.address_line2}` : order.address_line1,
      city: order.city,
      pincode: order.pincode,
      lat: order.lat,
      lng: order.lng
    };

    res.json({ success: true, order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Admin: Get all orders
const getAllOrders = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = `
      SELECT o.*, u.name as user_name, u.email as user_email, u.phone as user_phone
      FROM orders o 
      JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (status) { query += ' AND o.status = ?'; params.push(status); }
    if (search) {
      query += ' AND (o.order_number LIKE ? OR u.name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY o.created_at DESC';
    const [orders] = await db.query(query, params);
    
    for (const order of orders) {
      const [items] = await db.query(
        'SELECT oi.*, p.image FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
        [order.id]
      );
      order.items = items;
    }
    
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Admin: Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: 'Order status updated.' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { createRazorpayOrder, verifyPaymentAndCreateOrder, createCodOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus };
