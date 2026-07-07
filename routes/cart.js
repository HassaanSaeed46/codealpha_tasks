const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { memoryStore, shouldUseMemoryStore } = require('../dataStore');

const router = express.Router();

// All cart routes are protected
router.use(protect);

/**
 * Helper — populate cart products and compute the total.
 */
const getPopulatedCart = async (userId) => {
  if (shouldUseMemoryStore()) {
    return memoryStore.getCart(userId);
  }

  const user = await User.findById(userId).populate('cart.product');

  const items = user.cart.filter((item) => item.product); // guard against deleted products
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return { items, total: Math.round(total * 100) / 100 };
};

// -----------------------------------------------------------------------
// GET /api/cart
// -----------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const cart = await getPopulatedCart(req.user._id);
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -----------------------------------------------------------------------
// POST /api/cart — add an item (or increase its quantity)
// -----------------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, error: 'productId is required' });
    }

    if (shouldUseMemoryStore()) {
      const cart = await memoryStore.addToCart(req.user._id || req.user.id, productId, quantity);
      return res.status(200).json({ success: true, data: cart });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: 'Product not found' });
    }
    if (product.stock < quantity) {
      return res
        .status(400)
        .json({ success: false, error: 'Insufficient stock' });
    }

    const user = await User.findById(req.user._id);

    const existingItem = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }

    await user.save();

    const cart = await getPopulatedCart(user._id);
    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -----------------------------------------------------------------------
// PUT /api/cart/:productId — update quantity
// -----------------------------------------------------------------------
router.put('/:productId', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (shouldUseMemoryStore()) {
      const cart = await memoryStore.updateCartItem(req.user._id || req.user.id, req.params.productId, quantity);
      return res.json({ success: true, data: cart });
    }

    const user = await User.findById(req.user._id);

    const itemIndex = user.cart.findIndex(
      (item) => item.product.toString() === req.params.productId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, error: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      user.cart.splice(itemIndex, 1);
    } else {
      user.cart[itemIndex].quantity = quantity;
    }

    await user.save();

    const cart = await getPopulatedCart(user._id);
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -----------------------------------------------------------------------
// DELETE /api/cart/:productId — remove a single item
// -----------------------------------------------------------------------
router.delete('/:productId', async (req, res) => {
  try {
    if (shouldUseMemoryStore()) {
      const cart = await memoryStore.removeFromCart(req.user._id || req.user.id, req.params.productId);
      return res.json({ success: true, data: cart });
    }

    const user = await User.findById(req.user._id);

    user.cart.pull({ product: req.params.productId });
    await user.save();

    const cart = await getPopulatedCart(user._id);
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -----------------------------------------------------------------------
// DELETE /api/cart — clear entire cart
// -----------------------------------------------------------------------
router.delete('/', async (req, res) => {
  try {
    if (shouldUseMemoryStore()) {
      const cart = await memoryStore.clearCart(req.user._id || req.user.id);
      return res.json({ success: true, data: cart });
    }

    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();

    res.json({ success: true, data: { items: [], total: 0 } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
