const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

const products = [
  // ── Electronics ──────────────────────────────────────────────────────
  {
    name: 'Wireless Headphones',
    description:
      'Premium over-ear wireless headphones with active noise cancellation, 30-hour battery life, and ultra-comfortable memory-foam ear cushions. Perfect for commuting, travel, or deep-focus work sessions.',
    price: 79.99,
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    category: 'Electronics',
    stock: 45,
    rating: 4.5,
    numReviews: 128,
    featured: true,
  },
  {
    name: 'Smart Watch',
    description:
      'Feature-packed smart watch with heart-rate monitoring, GPS tracking, sleep analysis, and a stunning AMOLED display. Water-resistant to 50 metres with 7-day battery life.',
    price: 199.99,
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    category: 'Electronics',
    stock: 30,
    rating: 4.3,
    numReviews: 95,
    featured: true,
  },
  {
    name: 'Bluetooth Speaker',
    description:
      'Portable Bluetooth 5.3 speaker delivering 360° immersive sound. IPX7 waterproof, 20-hour playtime, and built-in microphone for hands-free calls. Ideal for outdoor adventures.',
    price: 49.99,
    image:
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
    category: 'Electronics',
    stock: 60,
    rating: 4.2,
    numReviews: 73,
    featured: false,
  },
  {
    name: 'USB-C Hub',
    description:
      '7-in-1 USB-C hub featuring 4K HDMI output, 100W Power Delivery pass-through, SD/microSD card readers, USB 3.0 ports, and Gigabit Ethernet. Aluminium body with braided cable.',
    price: 34.99,
    image:
      'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500',
    category: 'Electronics',
    stock: 80,
    rating: 4.4,
    numReviews: 62,
    featured: false,
  },

  // ── Clothing ─────────────────────────────────────────────────────────
  {
    name: 'Leather Jacket',
    description:
      'Hand-crafted genuine leather biker jacket with quilted lining, YKK zippers, and adjustable waist belt. A timeless wardrobe essential built to last for years.',
    price: 149.99,
    image:
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
    category: 'Clothing',
    stock: 20,
    rating: 4.7,
    numReviews: 54,
    featured: true,
  },
  {
    name: 'Running Shoes',
    description:
      'Lightweight performance running shoes with responsive cushioning, breathable knit upper, and durable rubber outsole. Engineered for road and treadmill training.',
    price: 89.99,
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    category: 'Clothing',
    stock: 50,
    rating: 4.6,
    numReviews: 112,
    featured: true,
  },
  {
    name: 'Denim Backpack',
    description:
      'Stylish denim backpack with padded laptop compartment, multiple organiser pockets, and reinforced stitching. Perfect for daily commutes and weekend getaways.',
    price: 59.99,
    image:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
    category: 'Clothing',
    stock: 35,
    rating: 4.1,
    numReviews: 41,
    featured: false,
  },

  // ── Home & Kitchen ───────────────────────────────────────────────────
  {
    name: 'Coffee Maker',
    description:
      '12-cup programmable drip coffee maker with thermal carafe, brew-strength control, and auto-shutoff. Enjoy café-quality coffee every morning from the comfort of home.',
    price: 69.99,
    image:
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500',
    category: 'Home & Kitchen',
    stock: 25,
    rating: 4.4,
    numReviews: 87,
    featured: false,
  },
  {
    name: 'Cast Iron Skillet',
    description:
      'Pre-seasoned 12-inch cast iron skillet for superior heat retention and even cooking. Oven-safe to 500 °F, compatible with all cooktops including induction.',
    price: 39.99,
    image:
      'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500',
    category: 'Home & Kitchen',
    stock: 40,
    rating: 4.8,
    numReviews: 156,
    featured: true,
  },
  {
    name: 'Smart LED Bulbs',
    description:
      '4-pack of Wi-Fi-enabled RGBW smart LED bulbs. Control colour, brightness, and schedules via app or voice assistant. 800 lumens each, 60W-equivalent, energy-efficient.',
    price: 29.99,
    image:
      'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=500',
    category: 'Home & Kitchen',
    stock: 70,
    rating: 4.3,
    numReviews: 68,
    featured: false,
  },

  // ── Sports & Outdoors ────────────────────────────────────────────────
  {
    name: 'Yoga Mat',
    description:
      'Extra-thick 6mm eco-friendly TPE yoga mat with alignment lines and non-slip texture on both sides. Includes carrying strap. Perfect for yoga, Pilates, and stretching.',
    price: 24.99,
    image:
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
    category: 'Sports & Outdoors',
    stock: 55,
    rating: 4.5,
    numReviews: 93,
    featured: false,
  },
  {
    name: 'Water Bottle',
    description:
      'Vacuum-insulated stainless-steel water bottle (750 ml). Keeps drinks cold for 24 hours or hot for 12. Leak-proof lid, BPA-free, and available in multiple colours.',
    price: 19.99,
    image:
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
    category: 'Sports & Outdoors',
    stock: 100,
    rating: 4.6,
    numReviews: 210,
    featured: false,
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Insert products
    const insertedProducts = await Product.insertMany(products);
    console.log(`📦 Seeded ${insertedProducts.length} products`);

    // Create demo admin user
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@store.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log(`👤 Created admin user: ${adminUser.email}`);

    console.log('\n🎉 Database seeded successfully!');
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

seedDatabase();
