const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const seedDatabase = async () => {
  console.log('🌱 Starting VENDO database seed...');
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Seed Users (Admin & Customer)
    console.log('👤 Seeding users...');
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('Admin@123', salt);
    const customerHash = await bcrypt.hash('Customer@123', salt);

    // Insert Admin
    const [adminCheck] = await connection.query('SELECT id FROM users WHERE email = ?', ['admin@vendo.com']);
    let adminId;
    if (adminCheck.length === 0) {
      const [res] = await connection.query(
        'INSERT INTO users (full_name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
        ['VENDO Admin', 'admin@vendo.com', adminHash, '+91 98765 43210', 'admin']
      );
      adminId = res.insertId;
      await connection.query('INSERT IGNORE INTO cart (user_id) VALUES (?)', [adminId]);
      await connection.query('INSERT IGNORE INTO wishlist (user_id) VALUES (?)', [adminId]);
    } else {
      adminId = adminCheck[0].id;
      await connection.query('UPDATE users SET password_hash = ?, role = "admin" WHERE id = ?', [adminHash, adminId]);
    }

    // Insert Customer
    const [custCheck] = await connection.query('SELECT id FROM users WHERE email = ?', ['customer@vendo.com']);
    let customerId;
    if (custCheck.length === 0) {
      const [res] = await connection.query(
        'INSERT INTO users (full_name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
        ['Rahul Sharma', 'customer@vendo.com', customerHash, '+91 98111 22334', 'customer']
      );
      customerId = res.insertId;
      await connection.query('INSERT IGNORE INTO cart (user_id) VALUES (?)', [customerId]);
      await connection.query('INSERT IGNORE INTO wishlist (user_id) VALUES (?)', [customerId]);
    } else {
      customerId = custCheck[0].id;
    }

    // Default Address for Customer
    const [addrCheck] = await connection.query('SELECT id FROM addresses WHERE user_id = ?', [customerId]);
    if (addrCheck.length === 0) {
      await connection.query(
        `INSERT INTO addresses (user_id, full_name, phone, address_line, city, state, pincode, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [customerId, 'Rahul Sharma', '+91 98111 22334', 'Flat 402, Green Glen Heights, Bellandur', 'Bengaluru', 'Karnataka', '560103']
      );
    }

    // 2. Seed Categories
    console.log('📂 Seeding categories...');
    const categories = [
      {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Next-gen smart gadgets, smartphones, premium headphones, and cutting-edge computing.',
        image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80'
      },
      {
        name: 'Fashion',
        slug: 'fashion',
        description: 'Trendy apparel, designer footwear, and statement street fashion for men and women.',
        image_url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80'
      },
      {
        name: 'Beauty',
        slug: 'beauty',
        description: 'Luxury skincare, organic cosmetic essentials, hair care, and signature fragrances.',
        image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80'
      },
      {
        name: 'Home & Living',
        slug: 'home-living',
        description: 'Contemporary furniture, ambient lighting, kitchen essentials, and modern home decor.',
        image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80'
      },
      {
        name: 'Sports',
        slug: 'sports',
        description: 'Performance athletic gear, gym accessories, yoga mats, and outdoor adventure equipment.',
        image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80'
      },
      {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Luxury analog watches, polarized sunglasses, leather bags, and minimal jewelry.',
        image_url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80'
      }
    ];

    const categoryIdMap = {};
    for (const cat of categories) {
      const [existing] = await connection.query('SELECT id FROM categories WHERE slug = ?', [cat.slug]);
      if (existing.length === 0) {
        const [res] = await connection.query(
          'INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)',
          [cat.name, cat.slug, cat.description, cat.image_url]
        );
        categoryIdMap[cat.slug] = res.insertId;
      } else {
        categoryIdMap[cat.slug] = existing[0].id;
        await connection.query(
          'UPDATE categories SET image_url = ?, description = ? WHERE id = ?',
          [cat.image_url, cat.description, existing[0].id]
        );
      }
    }

    // 3. Seed Products
    console.log('🛍️ Seeding products...');
    const productsData = [
      // Electronics
      {
        name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
        slug: 'sony-wh-1000xm5-wireless-headphones',
        category_slug: 'electronics',
        brand: 'Sony',
        price: 29990.00,
        original_price: 34990.00,
        discount: 14,
        stock: 25,
        rating: 4.8,
        review_count: 142,
        is_featured: 1,
        is_trending: 1,
        is_deal: 1,
        description: 'Industry-leading noise cancellation with two processors and 8 microphones. Magnificent sound quality engineered with the new Integrated Processor V1. Ultra-comfortable lightweight design with soft fit leather.',
        specifications: { "Battery Life": "30 Hours", "Bluetooth": "v5.2", "Weight": "250g", "Charging": "USB-C Quick Charge", "Warranty": "1 Year" },
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80'
        ]
      },
      {
        name: 'Apple MacBook Air M3 15-inch 16GB 512GB Midnight',
        slug: 'apple-macbook-air-m3-15-inch',
        category_slug: 'electronics',
        brand: 'Apple',
        price: 134900.00,
        original_price: 144900.00,
        discount: 7,
        stock: 12,
        rating: 4.9,
        review_count: 98,
        is_featured: 1,
        is_trending: 1,
        is_deal: 0,
        description: 'Supercharged by M3, the 15-inch MacBook Air is impossibly thin and fast. Up to 18 hours of battery life, Liquid Retina display, 1080p FaceTime HD camera, and immersive spatial audio.',
        specifications: { "Processor": "Apple M3 Chip", "RAM": "16GB Unified", "Storage": "512GB SSD", "Display": "15.3-inch Liquid Retina", "Weight": "1.51 kg" },
        images: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
          'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80'
        ]
      },
      {
        name: 'Samsung Galaxy S24 Ultra 5G AI Smartphone (Titanium Gray)',
        slug: 'samsung-galaxy-s24-ultra-5g',
        category_slug: 'electronics',
        brand: 'Samsung',
        price: 119999.00,
        original_price: 134999.00,
        discount: 11,
        stock: 18,
        rating: 4.7,
        review_count: 85,
        is_featured: 1,
        is_trending: 1,
        is_deal: 1,
        description: 'Meet Galaxy S24 Ultra with Galaxy AI. 200MP camera with Quad Telephoto system, built-in S Pen, titanium exterior shield, and Snapdragon 8 Gen 3 processor for unparalleled mobile gaming.',
        specifications: { "Display": "6.8 inch Dynamic AMOLED 2X 120Hz", "Camera": "200MP + 50MP + 12MP + 10MP", "Battery": "5000 mAh", "RAM": "12GB", "Storage": "256GB" },
        images: [
          'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80',
          'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80'
        ]
      },
      {
        name: 'Logitech MX Master 3S Wireless Performance Mouse',
        slug: 'logitech-mx-master-3s-wireless-mouse',
        category_slug: 'electronics',
        brand: 'Logitech',
        price: 8995.00,
        original_price: 10995.00,
        discount: 18,
        stock: 30,
        rating: 4.8,
        review_count: 215,
        is_featured: 0,
        is_trending: 1,
        is_deal: 0,
        description: 'Quiet clicks and 8K DPI any-surface tracking. Electromagnetic MagSpeed wheel delivers precise control and 1,000 lines per second scrolling speed with premium ergonomics.',
        specifications: { "Sensor": "Darkfield High Precision 8000 DPI", "Connectivity": "Bluetooth / Logi Bolt", "Battery": "Up to 70 days", "Weight": "141g" },
        images: [
          'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80',
          'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80'
        ]
      },

      // Fashion
      {
        name: 'Levi\'s Men\'s Classic Trucker Denim Jacket',
        slug: 'levis-mens-classic-trucker-denim-jacket',
        category_slug: 'fashion',
        brand: 'Levi\'s',
        price: 3899.00,
        original_price: 5999.00,
        discount: 35,
        stock: 20,
        rating: 4.6,
        review_count: 76,
        is_featured: 1,
        is_trending: 0,
        is_deal: 1,
        description: 'An iconic classic since 1967. Crafted in non-stretch 100% durable cotton denim with button flap chest pockets and adjustable side tabs. Hits at the hip for clean layering.',
        specifications: { "Material": "100% Cotton", "Fit": "Regular Fit", "Closure": "Button Front", "Care": "Machine wash cold" },
        images: [
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
          'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800&q=80'
        ]
      },
      {
        name: 'Nike Air Max 270 React Men\'s Athletic Sneakers',
        slug: 'nike-air-max-270-react-sneakers',
        category_slug: 'fashion',
        brand: 'Nike',
        price: 11495.00,
        original_price: 13995.00,
        discount: 18,
        stock: 15,
        rating: 4.7,
        review_count: 184,
        is_featured: 1,
        is_trending: 1,
        is_deal: 0,
        description: 'Nike\'s first lifestyle Air Max brings style, comfort and big attitude. Max Air 270 unit delivers all-day cushion paired with breathable woven fabric upper for an airy, lightweight feel.',
        specifications: { "Sole": "Rubber with Max Air Unit", "Upper": "Synthetic Woven Mesh", "Closure": "Lace-Up", "Type": "Lifestyle / Running" },
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80'
        ]
      },
      {
        name: 'Zara Women\'s Minimalist Trench Coat (Camel Beige)',
        slug: 'zara-womens-minimalist-trench-coat',
        category_slug: 'fashion',
        brand: 'Zara',
        price: 6990.00,
        original_price: 8990.00,
        discount: 22,
        stock: 14,
        rating: 4.5,
        review_count: 53,
        is_featured: 0,
        is_trending: 1,
        is_deal: 1,
        description: 'Double-breasted coat made of water-repellent cotton blend fabric. Lapel collar, long sleeves with tab details, side welt pockets, and tied fabric belt.',
        specifications: { "Material": "65% Cotton, 35% Polyester", "Length": "Midi", "Season": "Autumn / Winter / Spring" },
        images: [
          'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80'
        ]
      },
      {
        name: 'H&M Pure Linen Relaxed Fit Casual Shirt',
        slug: 'hm-pure-linen-relaxed-shirt',
        category_slug: 'fashion',
        brand: 'H&M',
        price: 2299.00,
        original_price: 2999.00,
        discount: 23,
        stock: 40,
        rating: 4.4,
        review_count: 67,
        is_featured: 0,
        is_trending: 0,
        is_deal: 0,
        description: 'Shirt in airy, woven pure linen with a resort collar, French front, and relaxed silhouette. Breathable natural texture that softens with every wash.',
        specifications: { "Material": "100% French Linen", "Fit": "Relaxed Fit", "Collar": "Camp / Resort Collar" },
        images: [
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
          'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80'
        ]
      },

      // Beauty
      {
        name: 'Estée Lauder Advanced Night Repair Synchronized Multi-Recovery Complex 50ml',
        slug: 'estee-lauder-advanced-night-repair-50ml',
        category_slug: 'beauty',
        brand: 'Estée Lauder',
        price: 7900.00,
        original_price: 8900.00,
        discount: 11,
        stock: 22,
        rating: 4.9,
        review_count: 310,
        is_featured: 1,
        is_trending: 1,
        is_deal: 0,
        description: 'Harness the restorative power of night. Deep and rapid penetrating serum reduces the look of multiple signs of aging caused by the environmental assaults of modern life.',
        specifications: { "Skin Type": "All Skin Types", "Volume": "50 ml", "Key Ingredient": "Hyaluronic Acid & Chronolux Power Signal Tech", "Texture": "Silky Liquid" },
        images: [
          'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
          'https://images.unsplash.com/photo-1608248597359-573587e60b13?w=800&q=80'
        ]
      },
      {
        name: 'Kiehl\'s Ultra Facial Cream with Squalane 50ml',
        slug: 'kiehls-ultra-facial-cream-50ml',
        category_slug: 'beauty',
        brand: 'Kiehl\'s',
        price: 3200.00,
        original_price: 3600.00,
        discount: 11,
        stock: 18,
        rating: 4.8,
        review_count: 145,
        is_featured: 0,
        is_trending: 1,
        is_deal: 1,
        description: '24-hour daily face moisturizer with olive-derived Squalane and Glacial Glycoprotein to hydrate skin for softer, smoother, visibly healthier skin.',
        specifications: { "Volume": "50 ml", "Benefits": "24H Hydration, Barrier Repair", "Paraben-Free": "Yes" },
        images: [
          'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80'
        ]
      },
      {
        name: 'Dior Sauvage Eau De Parfum for Men 100ml',
        slug: 'dior-sauvage-eau-de-parfum-100ml',
        category_slug: 'beauty',
        brand: 'Dior',
        price: 12500.00,
        original_price: 14000.00,
        discount: 11,
        stock: 10,
        rating: 4.9,
        review_count: 420,
        is_featured: 1,
        is_trending: 1,
        is_deal: 0,
        description: 'A powerful and noble composition with fresh Calabrian bergamot notes and intoxicating Papua New Guinean vanilla absolute. Radiant and fiercely charismatic.',
        specifications: { "Volume": "100 ml", "Fragrance Family": "Earthy & Woody", "Top Notes": "Reggio Bergamot", "Heart Notes": "Vanilla Absolute" },
        images: [
          'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
          'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80'
        ]
      },
      {
        name: 'The Ordinary Niacinamide 10% + Zinc 1% High-Strength Serum 30ml',
        slug: 'the-ordinary-niacinamide-10-zinc-1-serum',
        category_slug: 'beauty',
        brand: 'The Ordinary',
        price: 650.00,
        original_price: 750.00,
        discount: 13,
        stock: 55,
        rating: 4.6,
        review_count: 530,
        is_featured: 0,
        is_trending: 0,
        is_deal: 1,
        description: 'Water-based formula that boosts skin brightness, improves skin smoothness and reinforces the skin barrier over time. Highly effective for blemish-prone skin.',
        specifications: { "Volume": "30 ml", "Cruelty-Free": "Yes", "Key Actives": "10% Niacinamide, 1% Zinc PCA" },
        images: [
          'https://images.unsplash.com/photo-1608248597359-573587e60b13?w=800&q=80'
        ]
      },

      // Home & Living
      {
        name: 'Dyson V12 Detect Slim Total Clean Cordless Vacuum Cleaner',
        slug: 'dyson-v12-detect-slim-cordless-vacuum',
        category_slug: 'home-living',
        brand: 'Dyson',
        price: 52900.00,
        original_price: 65900.00,
        discount: 20,
        stock: 8,
        rating: 4.8,
        review_count: 112,
        is_featured: 1,
        is_trending: 1,
        is_deal: 1,
        description: 'Dyson\'s most powerful, compact cordless vacuum. Laser reveals microscopic dust on hard floors. Piezo sensor counts and measures the size of dust particles.',
        specifications: { "Run Time": "Up to 60 Mins", "Bin Volume": "0.35 L", "Suction Power": "150 AW", "Weight": "2.2 kg" },
        images: [
          'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&q=80',
          'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&q=80'
        ]
      },
      {
        name: 'De\'Longhi Dedica Deluxe Espresso & Cappuccino Machine (Stainless Steel)',
        slug: 'delonghi-dedica-deluxe-espresso-machine',
        category_slug: 'home-living',
        brand: 'De\'Longhi',
        price: 24999.00,
        original_price: 29999.00,
        discount: 17,
        stock: 15,
        rating: 4.7,
        review_count: 88,
        is_featured: 1,
        is_trending: 0,
        is_deal: 0,
        description: 'Slim, modern 6-inch footprint with 15-bar professional pressure pump. Manual froth arm allows barista-quality micro-foam for rich lattes and cappuccinos at home.',
        specifications: { "Pump Pressure": "15 Bar", "Water Tank": "1 Liter", "Body": "Brushed Stainless Steel", "Power": "1300W" },
        images: [
          'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
          'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80'
        ]
      },
      {
        name: 'Philips Hue White & Color Ambiance Smart LED Starter Kit',
        slug: 'philips-hue-smart-led-starter-kit',
        category_slug: 'home-living',
        brand: 'Philips',
        price: 8499.00,
        original_price: 11999.00,
        discount: 29,
        stock: 24,
        rating: 4.6,
        review_count: 94,
        is_featured: 0,
        is_trending: 1,
        is_deal: 1,
        description: 'Transform your home with 16 million vibrant colors and warm-to-cool white light. Includes 3 smart bulbs, Hue Bridge, and smart dimmer switch. Works with Alexa and Siri.',
        specifications: { "Bulbs": "3 x E27 800 Lumens", "Connectivity": "Zigbee + Hue Bridge", "Lifespan": "25,000 Hours" },
        images: [
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80'
        ]
      },
      {
        name: 'Organic Bamboo Charcoal Ergonomic Memory Foam Pillow (Set of 2)',
        slug: 'organic-bamboo-ergonomic-memory-foam-pillow',
        category_slug: 'home-living',
        brand: 'Wakefit',
        price: 1999.00,
        original_price: 3499.00,
        discount: 43,
        stock: 35,
        rating: 4.5,
        review_count: 167,
        is_featured: 0,
        is_trending: 0,
        is_deal: 1,
        description: 'Contour memory foam pillow infused with activated bamboo charcoal for optimal neck alignment and odor elimination. Breathable quilted zipper cover.',
        specifications: { "Quantity": "Pack of 2", "Dimensions": "60 x 40 x 12 cm", "Cover": "Bamboo Viscose", "Warranty": "3 Years" },
        images: [
          'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80'
        ]
      },

      // Sports
      {
        name: 'Garmin Forerunner 265 AMOLED GPS Running Smartwatch',
        slug: 'garmin-forerunner-265-gps-smartwatch',
        category_slug: 'sports',
        brand: 'Garmin',
        price: 49490.00,
        original_price: 54990.00,
        discount: 10,
        stock: 11,
        rating: 4.9,
        review_count: 73,
        is_featured: 1,
        is_trending: 1,
        is_deal: 0,
        description: 'Brilliant 1.3-inch colorful AMOLED touchscreen with training readiness metrics, morning report, wrist-based running power, multi-band GNSS GPS, and up to 13 days of battery life.',
        specifications: { "Display": "1.3\" AMOLED Touchscreen", "Water Rating": "5 ATM (50m)", "Battery": "Up to 13 Days", "Sensors": "Heart Rate, Pulse Ox, Barometer" },
        images: [
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80',
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'
        ]
      },
      {
        name: 'Lululemon Align High-Rise 25" Ultra-Soft Yoga Leggings',
        slug: 'lululemon-align-high-rise-leggings',
        category_slug: 'sports',
        brand: 'Lululemon',
        price: 7800.00,
        original_price: 9200.00,
        discount: 15,
        stock: 25,
        rating: 4.8,
        review_count: 189,
        is_featured: 1,
        is_trending: 1,
        is_deal: 1,
        description: 'Engineered for yoga and lightweight movement. Powered by buttery-soft Nulu fabric that feels weightless on skin with four-way stretch and sweat-wicking breathability.',
        specifications: { "Fabric": "Nulu (81% Nylon, 19% Lycra)", "Rise": "High Rise", "Inseam": "25 inches", "Pocket": "Hidden waistband pocket" },
        images: [
          'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80',
          'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80'
        ]
      },
      {
        name: 'Bowflex SelectTech 552 Adjustable Dumbbells (Pair)',
        slug: 'bowflex-selecttech-552-adjustable-dumbbells',
        category_slug: 'sports',
        brand: 'Bowflex',
        price: 34999.00,
        original_price: 42999.00,
        discount: 19,
        stock: 5,
        rating: 4.9,
        review_count: 82,
        is_featured: 0,
        is_trending: 1,
        is_deal: 0,
        description: 'Replaces 15 sets of weights in one space-saving design. Adjusts from 2.5 kg to 24 kg per dumbbell with the simple turn of a dial. Smooth, quiet lifts with molding.',
        specifications: { "Weight Range": "2.5 kg to 24 kg per dumbbell", "Settings": "15 weight settings", "Dimensions": "43 x 20 x 23 cm" },
        images: [
          'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80'
        ]
      },
      {
        name: 'Manduka PRO 6mm High Density Grip Yoga Mat (Black Sage)',
        slug: 'manduka-pro-yoga-mat-6mm',
        category_slug: 'sports',
        brand: 'Manduka',
        price: 9999.00,
        original_price: 11999.00,
        discount: 17,
        stock: 16,
        rating: 4.7,
        review_count: 64,
        is_featured: 0,
        is_trending: 0,
        is_deal: 1,
        description: 'The standard of performance yoga mats. Unmatched density and cushion for joint protection, closed-cell hygienic surface prevents sweat absorption, lifetime guarantee.',
        specifications: { "Thickness": "6 mm", "Weight": "3.4 kg", "Length": "180 cm x 66 cm", "Material": "Eco-certified Non-toxic PVC" },
        images: [
          'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80'
        ]
      },

      // Accessories
      {
        name: 'Seiko Presage Cocktail Time Automatic Watch (Sky Diving Blue)',
        slug: 'seiko-presage-cocktail-time-automatic-watch',
        category_slug: 'accessories',
        brand: 'Seiko',
        price: 39500.00,
        original_price: 45000.00,
        discount: 12,
        stock: 7,
        rating: 4.9,
        review_count: 114,
        is_featured: 1,
        is_trending: 1,
        is_deal: 0,
        description: 'Exquisite sunburst radial dial inspired by the Sky Diving cocktail. Powered by Seiko 4R35 automatic movement with 41-hour power reserve, date display, and box-shaped Hardlex crystal.',
        specifications: { "Movement": "Japanese Automatic Caliber 4R35", "Case Diameter": "40.5 mm", "Water Resistance": "50m", "Strap": "Stainless Steel Mesh Bracelet" },
        images: [
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'
        ]
      },
      {
        name: 'Ray-Ban Classic Aviator Polarized Sunglasses (Gold & Green G-15)',
        slug: 'ray-ban-classic-aviator-polarized-sunglasses',
        category_slug: 'accessories',
        brand: 'Ray-Ban',
        price: 9890.00,
        original_price: 12490.00,
        discount: 21,
        stock: 28,
        rating: 4.8,
        review_count: 240,
        is_featured: 1,
        is_trending: 1,
        is_deal: 1,
        description: 'First crafted in 1937 for US aviators. Timeless gold metal teardrop frames with authentic polarized green crystal lenses delivering 100% UV protection and crisp glare reduction.',
        specifications: { "Frame Material": "Metal (Polished Gold)", "Lens Technology": "Polarized G-15 Green", "Bridge Width": "14 mm", "Lens Width": "58 mm" },
        images: [
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80'
        ]
      },
      {
        name: 'Bellroy Classic Full Grain Leather Weekender Duffel Bag 45L',
        slug: 'bellroy-classic-leather-weekender-bag',
        category_slug: 'accessories',
        brand: 'Bellroy',
        price: 18900.00,
        original_price: 22900.00,
        discount: 17,
        stock: 9,
        rating: 4.7,
        review_count: 58,
        is_featured: 0,
        is_trending: 0,
        is_deal: 0,
        description: 'Spacious 45L carry-on weekender made from premium, environmentally certified leather and durable water-resistant recycled fabric. Magnetic closures, laptop compartment, and padded shoulder strap.',
        specifications: { "Capacity": "45 Liters", "Dimensions": "38 x 65 x 40 cm", "Material": "Gold-rated Leather + Baida Nylon", "Warranty": "3 Years" },
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80'
        ]
      },
      {
        name: 'Montblanc Meisterstück Platinum-Coated Ballpoint Pen',
        slug: 'montblanc-meisterstuck-platinum-ballpoint-pen',
        category_slug: 'accessories',
        brand: 'Montblanc',
        price: 36000.00,
        original_price: 40000.00,
        discount: 10,
        stock: 6,
        rating: 4.9,
        review_count: 45,
        is_featured: 0,
        is_trending: 1,
        is_deal: 0,
        description: 'The defining luxury writing instrument. Cap and barrel crafted in black precious resin inlaid with the iconic Montblanc white emblem. Three platinum-coated rings with embossed Montblanc lettering.',
        specifications: { "Material": "Precious Black Resin", "Trim": "Platinum-Coated", "Writing System": "Twist-action Ballpoint", "Made In": "Germany" },
        images: [
          'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&q=80'
        ]
      }
    ];

    for (const p of productsData) {
      const categoryId = categoryIdMap[p.category_slug];
      if (!categoryId) continue;

      const [existing] = await connection.query('SELECT id FROM products WHERE slug = ?', [p.slug]);
      let productId;

      if (existing.length === 0) {
        const [res] = await connection.query(
          `INSERT INTO products 
            (name, slug, description, specifications, category_id, brand, price, original_price, discount, stock, rating, review_count, is_featured, is_trending, is_deal, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
          [
            p.name,
            p.slug,
            p.description,
            JSON.stringify(p.specifications),
            categoryId,
            p.brand,
            p.price,
            p.original_price,
            p.discount,
            p.stock,
            p.rating,
            p.review_count,
            p.is_featured,
            p.is_trending,
            p.is_deal
          ]
        );
        productId = res.insertId;
      } else {
        productId = existing[0].id;
        await connection.query(
          `UPDATE products SET 
            name = ?, description = ?, specifications = ?, category_id = ?, brand = ?, price = ?,
            original_price = ?, discount = ?, stock = ?, rating = ?, review_count = ?,
            is_featured = ?, is_trending = ?, is_deal = ?
           WHERE id = ?`,
          [
            p.name,
            p.description,
            JSON.stringify(p.specifications),
            categoryId,
            p.brand,
            p.price,
            p.original_price,
            p.discount,
            p.stock,
            p.rating,
            p.review_count,
            p.is_featured,
            p.is_trending,
            p.is_deal,
            productId
          ]
        );
      }

      // Populate product images
      await connection.query('DELETE FROM product_images WHERE product_id = ?', [productId]);
      for (let i = 0; i < p.images.length; i++) {
        await connection.query(
          'INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)',
          [productId, p.images[i], i === 0 ? 1 : 0, i]
        );
      }
    }

    // 4. Seed Coupons
    console.log('🎟️ Seeding coupons...');
    const coupons = [
      {
        code: 'VENDO10',
        discount_type: 'percentage',
        discount_value: 10,
        min_order_amount: 999.00,
        max_discount_amount: 2500.00
      },
      {
        code: 'SAVE20',
        discount_type: 'percentage',
        discount_value: 20,
        min_order_amount: 4999.00,
        max_discount_amount: 5000.00
      },
      {
        code: 'WELCOME500',
        discount_type: 'fixed',
        discount_value: 500,
        min_order_amount: 1999.00,
        max_discount_amount: 500.00
      }
    ];

    for (const c of coupons) {
      await connection.query(
        `INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount_amount, is_active)
         VALUES (?, ?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE 
         discount_type = VALUES(discount_type), 
         discount_value = VALUES(discount_value),
         min_order_amount = VALUES(min_order_amount),
         max_discount_amount = VALUES(max_discount_amount)`,
        [c.code, c.discount_type, c.discount_value, c.min_order_amount, c.max_discount_amount]
      );
    }

    // 5. Seed Reviews for first few products
    console.log('⭐ Seeding reviews...');
    const [sampleProducts] = await connection.query('SELECT id FROM products LIMIT 3');
    const sampleComments = [
      { rating: 5, comment: 'Exceptional build quality and lightning-fast delivery! Absolutely love shopping on VENDO.' },
      { rating: 4, comment: 'Product matches description precisely. Premium finish and great customer support.' },
      { rating: 5, comment: 'Value for money deal! Packaged safely and arrived earlier than expected.' }
    ];

    for (const sp of sampleProducts) {
      for (const sc of sampleComments) {
        await connection.query(
          `INSERT INTO reviews (product_id, user_id, rating, comment)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment)`,
          [sp.id, customerId, sc.rating, sc.comment]
        );
      }
    }

    // 6. Seed Sample Order for Customer
    console.log('📦 Seeding sample initial order...');
    const [existingOrders] = await connection.query('SELECT id FROM orders WHERE user_id = ?', [customerId]);
    if (existingOrders.length === 0 && sampleProducts.length > 0) {
      const sampleProd = sampleProducts[0];
      const [prodInfo] = await connection.query(
        'SELECT name, price, (SELECT image_url FROM product_images WHERE product_id = products.id LIMIT 1) as img FROM products WHERE id = ?',
        [sampleProd.id]
      );

      if (prodInfo.length > 0) {
        const pPrice = parseFloat(prodInfo[0].price);
        const [ordRes] = await connection.query(
          `INSERT INTO orders 
            (order_number, user_id, subtotal, discount, shipping, total_amount, coupon_code, status, payment_method, payment_status, delivery_address_json)
           VALUES ('VND-100001', ?, ?, 0.00, 0.00, ?, 'VENDO10', 'delivered', 'UPI', 'paid', ?)`,
          [
            customerId,
            pPrice.toFixed(2),
            pPrice.toFixed(2),
            JSON.stringify({
              full_name: 'Rahul Sharma',
              phone: '+91 98111 22334',
              address_line: 'Flat 402, Green Glen Heights, Bellandur',
              city: 'Bengaluru',
              state: 'Karnataka',
              pincode: '560103'
            })
          ]
        );

        const sampleOrderId = ordRes.insertId;
        await connection.query(
          `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, total_price, image_url)
           VALUES (?, ?, ?, ?, 1, ?, ?)`,
          [sampleOrderId, sampleProd.id, prodInfo[0].name, pPrice, pPrice, prodInfo[0].img]
        );

        await connection.query(
          `INSERT INTO payments (order_id, payment_method, transaction_id, amount, status)
           VALUES (?, 'UPI', 'TXN-INITIAL-DEMO-001', ?, 'completed')`,
          [sampleOrderId, pPrice]
        );
      }
    }

    await connection.commit();
    console.log('✅ VENDO database successfully seeded!');
    console.log('----------------------------------------------------');
    console.log('🔑 ADMIN LOGIN:    admin@vendo.com    / Admin@123');
    console.log('👤 CUSTOMER LOGIN: customer@vendo.com / Customer@123');
    console.log('----------------------------------------------------');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    connection.release();
  }
};

// Execute if run directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedDatabase;
