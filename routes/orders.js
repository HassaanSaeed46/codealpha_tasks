const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const { memoryStore, shouldUseMemoryStore } = require('../dataStore');

const router = express.Router();

// All order routes are protected
router.use(protect);

// -----------------------------------------------------------------------
// POST /api/orders — place an order from the current cart
// -----------------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    if (shouldUseMemoryStore()) {
      const order = await memoryStore.placeOrder(req.user._id || req.user.id, req.body.shippingAddress);
      return res.status(201).json({ success: true, data: order });
    }

    const user = await User.findById(req.user._id).populate('cart.product');

    if (!user.cart || user.cart.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: 'Cart is empty' });
    }

    const { shippingAddress } = req.body;

    if (
      !shippingAddress ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.zip
    ) {
      return res.status(400).json({
        success: false,
        error: 'Shipping address with street, city, state and zip is required',
      });
    }

    // Build order items & validate stock
    const orderItems = [];
    for (const cartItem of user.cart) {
      const product = cartItem.product;
      if (!product) continue;

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for "${product.name}". Available: ${product.stock}`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });
    }

    if (orderItems.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: 'No valid items in cart' });
    }

    const totalPrice = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      user: user._id,
      items: orderItems,
      shippingAddress: {
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zip: shippingAddress.zip,
        country: shippingAddress.country || 'US',
      },
      totalPrice: Math.round(totalPrice * 100) / 100,
    });

    // Decrement stock for each ordered product
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear the user's cart
    user.cart = [];
    await user.save();

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -----------------------------------------------------------------------
// GET /api/orders — list current user's orders
// -----------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    if (shouldUseMemoryStore()) {
      const orders = await memoryStore.getOrders(req.user._id || req.user.id);
      return res.json({ success: true, data: orders });
    }

    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -----------------------------------------------------------------------
// GET /api/orders/:id — single order detail
// -----------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    if (shouldUseMemoryStore()) {
      const order = await memoryStore.getOrder(req.user._id || req.user.id, req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }
      return res.json({ success: true, data: order });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, error: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
