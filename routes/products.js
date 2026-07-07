const express = require('express');
const Product = require('../models/Product');
const { memoryStore, shouldUseMemoryStore } = require('../dataStore');

const router = express.Router();

// -----------------------------------------------------------------------
// GET /api/products/categories  (public)
// Defined BEFORE /:id to prevent "categories" from matching as an ObjectId.
// -----------------------------------------------------------------------
router.get('/categories', async (_req, res) => {
  try {
    if (shouldUseMemoryStore()) {
      const categories = await memoryStore.getCategories();
      return res.json({ success: true, data: categories });
    }

    const categories = await Product.distinct('category');
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -----------------------------------------------------------------------
// GET /api/products  (public)
// Supports: search, category, featured, sort, page, limit
// -----------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const { search, category, featured, sort } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 12, 1);
    const skip = (page - 1) * limit;

    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      filter.category = category;
    }
    if (featured !== undefined) {
      filter.featured = featured === 'true';
    }

    // Build sort object — default: newest first
    let sortObj = { createdAt: -1 };
    if (sort) {
      switch (sort) {
        case 'price_asc':
          sortObj = { price: 1 };
          break;
        case 'price_desc':
          sortObj = { price: -1 };
          break;
        case 'rating':
          sortObj = { rating: -1 };
          break;
        case 'name':
          sortObj = { name: 1 };
          break;
        default:
          sortObj = { createdAt: -1 };
      }
    }

    if (shouldUseMemoryStore()) {
      const result = await memoryStore.getProducts({
        search,
        category,
        featured,
        sort,
        page,
        limit,
      });

      return res.json({
        success: true,
        data: {
          products: result.products,
          page: result.page,
          totalPages: result.totalPages,
          totalProducts: result.totalProducts,
        },
      });
    }

    const [products, totalProducts] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      success: true,
      data: {
        products,
        page,
        totalPages,
        totalProducts,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -----------------------------------------------------------------------
// GET /api/products/:id  (public)
// -----------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    if (shouldUseMemoryStore()) {
      const product = await memoryStore.getProduct(req.params.id);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, error: 'Product not found' });
      }
      return res.json({ success: true, data: product });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
