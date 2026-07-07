const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { memoryStore, shouldUseMemoryStore } = require('../dataStore');

const router = express.Router();

/**
 * Helper — sign a JWT for a given user id.
 */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// -----------------------------------------------------------------------
// POST /api/auth/register
// -----------------------------------------------------------------------
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, error: 'Please provide name, email and password' });
    }

    if (shouldUseMemoryStore()) {
      const user = await memoryStore.registerUser({ name, email, password });
      const token = signToken(user._id || user.id);
      return res.status(201).json({
        success: true,
        data: {
          token,
          user: {
            id: user._id || user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, error: 'Email already in use' });
    }

    const user = await User.create({ name, email, password });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -----------------------------------------------------------------------
// POST /api/auth/login
// -----------------------------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: 'Please provide email and password' });
    }

    if (shouldUseMemoryStore()) {
      const user = await memoryStore.loginUser({ email, password });
      const token = signToken(user._id || user.id);
      return res.json({
        success: true,
        data: {
          token,
          user: {
            id: user._id || user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, error: 'Invalid email or password' });
    }

    const token = signToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -----------------------------------------------------------------------
// GET /api/auth/me  (protected)
// -----------------------------------------------------------------------
router.get('/me', protect, async (req, res) => {
  try {
    res.json({ success: true, data: req.user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
