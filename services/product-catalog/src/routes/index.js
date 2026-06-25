const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');

// GET /api/products/categories - Must be before /:id
router.get('/categories', ProductController.getCategories);

// GET /api/products - List all products
router.get('/', ProductController.getAll);

// GET /api/products/category/:categoryName
router.get('/category/:categoryName', ProductController.getByCategory);

// GET /api/products/:id
router.get('/:id', ProductController.getById);

// POST /api/products
router.post('/', ProductController.create);

// PUT /api/products/:id
router.put('/:id', ProductController.update);

// DELETE /api/products/:id
router.delete('/:id', ProductController.delete);

module.exports = router;
