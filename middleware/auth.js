const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { memoryStore, shouldUseMemoryStore } = require('../dataStore');

/**
 * protect — verifies the Bearer JWT, attaches the user to req.user.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: 'Not authorised — no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    if (shouldUseMemoryStore()) {
      user = await memoryStore.getUserById(decoded.id);
    } else {
      user = await User.findById(decoded.id);
    }

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: 'User belonging to this token no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, error: 'Not authorised — invalid token' });
  }
};

/**
 * admin — restricts access to users with the 'admin' role.
 * Must be used AFTER protect.
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res
    .status(403)
    .json({ success: false, error: 'Forbidden — admin access required' });
};

module.exports = { protect, admin };
