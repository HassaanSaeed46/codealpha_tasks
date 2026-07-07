const mongoose = require('mongoose');

const seedProducts = [
  {
    name: 'Wireless Headphones',
    description:
      'Premium over-ear wireless headphones with active noise cancellation, 30-hour battery life, and ultra-comfortable memory-foam ear cushions. Perfect for commuting, travel, or deep-focus work sessions.',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
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
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
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
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
    category: 'Electronics',
    stock: 60,
    rating: 4.2,
    numReviews: 73,
    featured: false,
  },
  {
    name: 'Leather Jacket',
    description:
      'Hand-crafted genuine leather biker jacket with quilted lining, YKK zippers, and adjustable waist belt. A timeless wardrobe essential built to last for years.',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
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
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    category: 'Clothing',
    stock: 50,
    rating: 4.6,
    numReviews: 112,
    featured: true,
  },
  {
    name: 'Coffee Maker',
    description:
      '12-cup programmable drip coffee maker with thermal carafe, brew-strength control, and auto-shutoff. Enjoy café-quality coffee every morning from the comfort of home.',
    price: 69.99,
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500',
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
    image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500',
    category: 'Home & Kitchen',
    stock: 40,
    rating: 4.8,
    numReviews: 156,
    featured: true,
  },
  {
    name: 'Yoga Mat',
    description:
      'Extra-thick 6mm eco-friendly TPE yoga mat with alignment lines and non-slip texture on both sides. Includes carrying strap. Perfect for yoga, Pilates, and stretching.',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
    category: 'Sports & Outdoors',
    stock: 55,
    rating: 4.5,
    numReviews: 93,
    featured: false,
  },
];

const createMemoryStore = () => {
  const products = seedProducts.map((product, index) => ({
    ...product,
    _id: `product-${index + 1}`,
    id: `product-${index + 1}`,
  }));

  const users = [
    {
      _id: 'admin-user',
      id: 'admin-user',
      name: 'Admin',
      email: 'admin@store.com',
      password: 'admin123',
      role: 'admin',
      cart: [],
    },
  ];

  const orders = [];

  const serializeProduct = (product) => ({
    ...product,
    id: product.id || product._id,
    _id: product._id || product.id,
  });

  const serializeUser = (user) => ({
    ...user,
    id: user.id || user._id,
    _id: user._id || user.id,
  });

  const serializeOrder = (order) => ({
    ...order,
    id: order.id || order._id,
    _id: order._id || order.id,
  });

  return {
    async getProducts({ search, category, featured, sort, page = 1, limit = 12 } = {}) {
      let filtered = [...products];

      if (search) {
        filtered = filtered.filter((product) =>
          product.name.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (category) {
        filtered = filtered.filter((product) => product.category === category);
      }

      if (featured !== undefined) {
        filtered = filtered.filter((product) => product.featured === (featured === 'true'));
      }

      if (sort) {
        switch (sort) {
          case 'price_asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
          case 'price_desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
          case 'rating':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
          case 'name':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
          default:
            filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        }
      }

      const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
      const pageSize = Math.max(parseInt(limit, 10) || 12, 1);
      const start = (pageNumber - 1) * pageSize;
      const pagedProducts = filtered.slice(start, start + pageSize).map(serializeProduct);
      const totalProducts = filtered.length;

      return {
        products: pagedProducts,
        page: pageNumber,
        totalPages: Math.ceil(totalProducts / pageSize),
        totalProducts,
      };
    },

    async getProduct(productId) {
      const product = products.find((item) => item.id === productId || item._id === productId);
      return product ? serializeProduct(product) : null;
    },

    async getCategories() {
      return [...new Set(products.map((product) => product.category))];
    },

    async registerUser({ name, email, password }) {
      const existing = users.find((user) => user.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        const error = new Error('Email already in use');
        error.statusCode = 409;
        throw error;
      }

      const user = {
        _id: `user-${Date.now()}`,
        id: `user-${Date.now()}`,
        name,
        email,
        password,
        role: 'customer',
        cart: [],
      };
      users.push(user);
      return serializeUser(user);
    },

    async loginUser({ email, password }) {
      const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
      if (!user || user.password !== password) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
      }
      return serializeUser(user);
    },

    async getUserById(userId) {
      const user = users.find((item) => item.id === userId || item._id === userId);
      return user ? serializeUser(user) : null;
    },

    async getCart(userId) {
      const user = users.find((item) => item.id === userId || item._id === userId);
      if (!user) return { items: [], total: 0 };

      const items = user.cart
        .map((entry) => {
          const product = products.find((item) => item.id === entry.productId || item._id === entry.productId);
          if (!product) return null;
          return {
            product: serializeProduct(product),
            quantity: entry.quantity,
          };
        })
        .filter(Boolean);

      const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      return { items, total: Math.round(total * 100) / 100 };
    },

    async addToCart(userId, productId, quantity = 1) {
      const user = users.find((item) => item.id === userId || item._id === userId);
      const product = products.find((item) => item.id === productId || item._id === productId);
      if (!user || !product) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
      }
      if (product.stock < quantity) {
        const error = new Error('Insufficient stock');
        error.statusCode = 400;
        throw error;
      }

      const existingItem = user.cart.find((item) => item.productId === productId || item.productId === product._id);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        user.cart.push({ productId: product.id, quantity });
      }

      return this.getCart(userId);
    },

    async updateCartItem(userId, productId, quantity) {
      const user = users.find((item) => item.id === userId || item._id === userId);
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      const itemIndex = user.cart.findIndex((item) => item.productId === productId || item.productId === productId);
      if (itemIndex === -1) {
        const error = new Error('Item not found in cart');
        error.statusCode = 404;
        throw error;
      }

      if (quantity <= 0) {
        user.cart.splice(itemIndex, 1);
      } else {
        const product = products.find((item) => item.id === productId || item._id === productId);
        if (!product || product.stock < quantity) {
          const error = new Error('Insufficient stock');
          error.statusCode = 400;
          throw error;
        }
        user.cart[itemIndex].quantity = quantity;
      }

      return this.getCart(userId);
    },

    async removeFromCart(userId, productId) {
      const user = users.find((item) => item.id === userId || item._id === userId);
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      user.cart = user.cart.filter((item) => item.productId !== productId && item.productId !== productId);
      return this.getCart(userId);
    },

    async clearCart(userId) {
      const user = users.find((item) => item.id === userId || item._id === userId);
      if (!user) return { items: [], total: 0 };
      user.cart = [];
      return { items: [], total: 0 };
    },

    async placeOrder(userId, shippingAddress) {
      const user = users.find((item) => item.id === userId || item._id === userId);
      if (!user || user.cart.length === 0) {
        const error = new Error('Cart is empty');
        error.statusCode = 400;
        throw error;
      }

      const items = [];
      for (const entry of user.cart) {
        const product = products.find((item) => item.id === entry.productId || item._id === entry.productId);
        if (!product) continue;
        if (product.stock < entry.quantity) {
          const error = new Error(`Insufficient stock for "${product.name}"`);
          error.statusCode = 400;
          throw error;
        }
        product.stock -= entry.quantity;
        items.push({
          product: serializeProduct(product),
          name: product.name,
          price: product.price,
          quantity: entry.quantity,
          image: product.image,
        });
      }

      const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const order = {
        _id: `order-${Date.now()}`,
        id: `order-${Date.now()}`,
        user: user.id,
        items,
        shippingAddress: {
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zip: shippingAddress.zip,
          country: shippingAddress.country || 'US',
        },
        totalPrice: Math.round(totalPrice * 100) / 100,
        status: 'pending',
        paymentMethod: 'Credit Card',
        createdAt: new Date().toISOString(),
      };
      orders.push(order);
      user.cart = [];
      return serializeOrder(order);
    },

    async getOrders(userId) {
      return orders
        .filter((order) => order.user === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(serializeOrder);
    },

    async getOrder(userId, orderId) {
      const order = orders.find((item) => item.user === userId && (item.id === orderId || item._id === orderId));
      return order ? serializeOrder(order) : null;
    },
  };
};

const shouldUseMemoryStore = (connectionState = mongoose.connection.readyState) =>
  process.env.USE_MEMORY_STORE === 'true' || connectionState !== 1;

const memoryStore = createMemoryStore();

module.exports = {
  createMemoryStore,
  memoryStore,
  shouldUseMemoryStore,
};
