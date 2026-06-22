const db = require('../config/db');

// Get all products (with filters and rating statistics)
const getProducts = async (req, res) => {
  try {
    const { category, search, status } = req.query;
    let query = `
      SELECT p.*, c.name as category_name,
             COALESCE(avg_table.average_rating, 0) as average_rating,
             COALESCE(avg_table.total_reviews, 0) as total_reviews
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN (
        SELECT product_id, ROUND(AVG(rating), 1) as average_rating, COUNT(*) as total_reviews 
        FROM reviews 
        GROUP BY product_id
      ) avg_table ON p.id = avg_table.product_id
      WHERE 1=1
    `;
    const params = [];
    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    } else {
      query += " AND p.status = 'active'";
    }
    if (category && category !== 'all') {
      query += ' AND p.category_id = ?';
      params.push(category);
    }
    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY p.created_at DESC';
    const [products] = await db.query(query, params);
    res.json({ success: true, products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get single product details, images, and reviews
const getProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const [products] = await db.query(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
      [productId]
    );
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    const product = products[0];

    // Get additional product images
    const [dbImages] = await db.query('SELECT image_url FROM product_images WHERE product_id = ? ORDER BY is_main DESC', [productId]);
    // Convert to list of urls. If empty, fallback to product's main image.
    const images = dbImages.length > 0 ? dbImages.map(img => img.image_url) : [product.image];

    // Get customer reviews
    const [reviews] = await db.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name as user_name 
       FROM reviews r 
       LEFT JOIN users u ON r.user_id = u.id 
       WHERE r.product_id = ? 
       ORDER BY r.created_at DESC`,
      [productId]
    );

    // Get review images for each review
    for (let i = 0; i < reviews.length; i++) {
      const [revImages] = await db.query('SELECT image_url FROM review_images WHERE review_id = ?', [reviews[i].id]);
      reviews[i].images = revImages.map(img => img.image_url);
    }

    // Get rating stats
    const [ratingStats] = await db.query(
      'SELECT COALESCE(AVG(rating), 0) as average_rating, COUNT(*) as total_reviews FROM reviews WHERE product_id = ?',
      [productId]
    );
    const avgRating = parseFloat(parseFloat(ratingStats[0].average_rating).toFixed(1));
    const totalReviews = parseInt(ratingStats[0].total_reviews);

    res.json({
      success: true,
      product: {
        ...product,
        images,
        rating_stats: {
          average_rating: avgRating,
          total_reviews: totalReviews
        },
        reviews
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Admin: Get all products (including inactive)
const getAllProductsAdmin = async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
    const params = [];
    if (search) {
      query += ' AND p.name LIKE ?';
      params.push(`%${search}%`);
    }
    query += ' ORDER BY p.created_at DESC';
    const [products] = await db.query(query, params);
    res.json({ success: true, products });
  } catch (error) {
    console.error('Admin get products error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Create product
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category_id, status } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const [result] = await db.query(
      'INSERT INTO products (name, description, price, stock, image, category_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, price, stock || 0, image, category_id || null, status || 'active']
    );
    res.status(201).json({ success: true, message: 'Product created successfully.', productId: result.insertId });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category_id, status } = req.body;
    const [existing] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    const image = req.file ? `/uploads/${req.file.filename}` : existing[0].image;
    await db.query(
      'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, image = ?, category_id = ?, status = ? WHERE id = ?',
      [name, description, price, stock, image, category_id, status, req.params.id]
    );
    res.json({ success: true, message: 'Product updated successfully.' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Add product review (verified purchase only)
const addReview = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;
    const { rating, comment, order_id } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    if (!order_id) {
      return res.status(400).json({ success: false, message: 'Order ID is required to submit a review.' });
    }

    // 1. Verify user ordered this product in this order
    const [orderItems] = await db.query(
      'SELECT oi.id FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.id = ? AND o.user_id = ? AND oi.product_id = ?',
      [order_id, userId, productId]
    );
    if (orderItems.length === 0) {
      return res.status(403).json({ success: false, message: 'You can only review products you have ordered.' });
    }

    // 2. Verify order is delivered
    const [orders] = await db.query('SELECT status FROM orders WHERE id = ?', [order_id]);
    if (orders.length === 0 || orders[0].status !== 'delivered') {
      return res.status(400).json({ success: false, message: 'You can only review products from delivered orders.' });
    }

    // 3. Verify user hasn't already reviewed this product for this order
    const [existingReviews] = await db.query(
      'SELECT id FROM reviews WHERE user_id = ? AND product_id = ? AND order_id = ?',
      [userId, productId, order_id]
    );
    if (existingReviews.length > 0) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this product for this order.' });
    }

    // Insert the review
    const [result] = await db.query(
      'INSERT INTO reviews (product_id, user_id, order_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [productId, userId, order_id, rating, comment || null]
    );
    const reviewId = result.insertId;

    // Handle review images upload
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = `/uploads/${file.filename}`;
        await db.query(
          'INSERT INTO review_images (review_id, image_url) VALUES (?, ?)',
          [reviewId, url]
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully.'
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ success: false, message: 'Server error while submitting review.' });
  }
};

module.exports = { getProducts, getProduct, getAllProductsAdmin, createProduct, updateProduct, deleteProduct, addReview };
