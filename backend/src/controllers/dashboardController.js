const db = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    const [[userCount]] = await db.query('SELECT COUNT(*) as total FROM users WHERE role = "customer"');
    const [[productCount]] = await db.query('SELECT COUNT(*) as total FROM products');
    const [[orderCount]] = await db.query('SELECT COUNT(*) as total FROM orders');
    const [[revenueResult]] = await db.query('SELECT SUM(total_amount) as total FROM orders WHERE payment_status = "paid"');
    
    // Order status counts
    const [statusCounts] = await db.query(
      'SELECT status, COUNT(*) as count FROM orders GROUP BY status'
    );

    // Monthly orders for chart (last 6 months)
    const [monthlyOrders] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%b %Y') as month, COUNT(*) as count, SUM(total_amount) as revenue
      FROM orders 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY created_at ASC
    `);

    // Top categories
    const [topCategories] = await db.query(`
      SELECT c.name, COUNT(oi.id) as total_sold
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    const statusMap = {};
    statusCounts.forEach(s => { statusMap[s.status] = s.count; });

    res.json({
      success: true,
      stats: {
        totalUsers: userCount.total,
        totalProducts: productCount.total,
        totalOrders: orderCount.total,
        totalRevenue: revenueResult.total || 0,
        orderStatus: {
          pending: statusMap.pending || 0,
          confirmed: statusMap.confirmed || 0,
          packed: statusMap.packed || 0,
          out_for_delivery: statusMap.out_for_delivery || 0,
          delivered: statusMap.delivered || 0,
          cancelled: statusMap.cancelled || 0
        },
        monthlyOrders,
        topCategories
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getDashboardStats };
