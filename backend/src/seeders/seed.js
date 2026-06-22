const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const seed = async () => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL server');

    const dbName = process.env.DB_NAME || 'shopkart_db';
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    let schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Replace any hardcoded 'shopkart_db' in schema.sql with process.env.DB_NAME
    schemaSql = schemaSql.replace(/shopkart_db/g, dbName);

    console.log(`⏳ Initializing database and tables for "${dbName}"...`);
    await connection.query(schemaSql);
    console.log('✅ Database and tables initialized');

    await connection.query(`USE \`${dbName}\``);
    console.log(`✅ Using database "${dbName}"`);

    // Seed Categories
    await connection.query('DELETE FROM categories');
    const [catResult] = await connection.query(
      'INSERT INTO categories (name, status) VALUES ?',
      [[
        ['Electronics', 'active'],
        ['Fashion', 'active'],
        ['Home & Kitchen', 'active'],
        ['Beauty', 'active'],
        ['Sports', 'active'],
        ['Books', 'active']
      ]]
    );
    console.log('✅ Categories seeded');

    // Get category IDs
    const [cats] = await connection.query('SELECT id, name FROM categories');
    const catMap = {};
    cats.forEach(c => { catMap[c.name] = c.id; });

    // Seed Products
    await connection.query('DELETE FROM products');
    await connection.query(
      'INSERT INTO products (name, description, price, stock, image, category_id, status) VALUES ?',
      [[
        [
          'Wireless Headphones',
          'High quality wireless headphones with noise cancellation and premium sound. Up to 30 hours battery life.',
          2999,
          45,
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
          catMap['Electronics'],
          'active'
        ],
        [
          'Smart Watch',
          'Feature-rich smartwatch with health monitoring, GPS, and 7-day battery life.',
          4999,
          30,
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
          catMap['Electronics'],
          'active'
        ],
        [
          'Backpack',
          'Durable 40L waterproof backpack perfect for travel and daily use.',
          1459,
          60,
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
          catMap['Fashion'],
          'active'
        ],
        [
          'Running Shoes',
          'Lightweight and comfortable running shoes with superior grip and cushioning.',
          2199,
          25,
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
          catMap['Sports'],
          'active'
        ],
        [
          'Sunglasses',
          'UV400 protection polarized sunglasses with premium frame and lenses.',
          999,
          80,
          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80',
          catMap['Fashion'],
          'active'
        ],
        [
          'Perfume',
          'Elegant long-lasting fragrance for men and women. 100ml bottle.',
          1299,
          35,
          'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80',
          catMap['Beauty'],
          'active'
        ],
        [
          'Coffee Maker',
          'Automatic drip coffee maker with 12-cup capacity and programmable timer.',
          3499,
          20,
          'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',
          catMap['Home & Kitchen'],
          'active'
        ],
        [
          'Yoga Mat',
          'Non-slip premium yoga mat with alignment lines and carrying strap. 6mm thick.',
          799,
          50,
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80',
          catMap['Sports'],
          'active'
        ]
      ]]
    );
    console.log('✅ Products seeded');

    // Seed Admin User
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    
    // Clear Orders, Reviews, and Users
    await connection.query('DELETE FROM order_items');
    await connection.query('DELETE FROM orders');
    await connection.query('DELETE FROM review_images');
    await connection.query('DELETE FROM reviews');
    await connection.query('DELETE FROM password_otps');
    await connection.query('DELETE FROM users');
    
    await connection.query(
      'INSERT INTO users (name, email, password, phone, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      ['Admin', 'admin@shopkart.com', adminPassword, '9999999999', 'admin', 'active']
    );
    console.log('✅ Admin user seeded');

    // Get product IDs
    const [seededProducts] = await connection.query('SELECT id, name, price, image FROM products');
    const productMap = {};
    seededProducts.forEach(p => { productMap[p.name] = p; });

    // Seed Product Images
    await connection.query('DELETE FROM product_images');
    const headphones = productMap['Wireless Headphones'];
    const smartwatch = productMap['Smart Watch'];
    const shoes = productMap['Running Shoes'];

    if (headphones && smartwatch && shoes) {
      await connection.query(
        'INSERT INTO product_images (product_id, image_url, is_main) VALUES ?',
        [[
          [headphones.id, headphones.image, 1],
          [headphones.id, 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&q=80', 0],
          [headphones.id, 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=400&q=80', 0],
          
          [smartwatch.id, smartwatch.image, 1],
          [smartwatch.id, 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&q=80', 0],
          [smartwatch.id, 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400&q=80', 0],

          [shoes.id, shoes.image, 1],
          [shoes.id, 'https://images.unsplash.com/photo-1460353581641-37baddff0d21?w=400&q=80', 0],
          [shoes.id, 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&q=80', 0]
        ]]
      );
      console.log('✅ Product images seeded');
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('📧 Admin Email: admin@shopkart.com');
    console.log('🔑 Admin Password: Admin@123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

seed();
