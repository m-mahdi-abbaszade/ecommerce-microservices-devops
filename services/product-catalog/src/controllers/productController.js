const { Op } = require('sequelize');
const { Product, Category } = require('../models');

class ProductController {

  // GET /api/products - List all products with pagination and filters
  static async getAll(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        category,
        minPrice,
        maxPrice,
        sort = 'created_at',
        order = 'DESC'
      } = req.query;

      const where = { is_active: true };

      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (category) {
        where['$category.name$'] = { [Op.iLike]: `%${category}%` };
      }

      if (minPrice) where.price = { ...where.price, [Op.gte]: parseFloat(minPrice) };
      if (maxPrice) where.price = { ...where.price, [Op.lte]: parseFloat(maxPrice) };

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { count, rows } = await Product.findAndCountAll({
        where,
        include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
        limit: parseInt(limit),
        offset,
        order: [[sort, order]]
      });

      res.json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/products/:id - Get product by ID
  static async getById(req, res, next) {
    try {
      const product = await Product.findByPk(req.params.id, {
        include: [{ model: Category, as: 'category' }]
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/products/category/:categoryName - Filter by category
  static async getByCategory(req, res, next) {
    try {
      const products = await Product.findAll({
        include: [{
          model: Category,
          as: 'category',
          where: { name: { [Op.iLike]: `%${req.params.categoryName}%` } }
        }],
        where: { is_active: true },
        order: [['created_at', 'DESC']]
      });

      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/products - Create product
  static async create(req, res, next) {
    try {
      const { name, description, price, image_url, category_id, sku, brand } = req.body;

      if (!name || !price) {
        return res.status(400).json({
          success: false,
          error: 'Name and price are required'
        });
      }

      const product = await Product.create({
        name, description, price, image_url, category_id, sku, brand
      });

      const result = await Product.findByPk(product.id, {
        include: [{ model: Category, as: 'category' }]
      });

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/products/:id - Update product
  static async update(req, res, next) {
    try {
      const product = await Product.findByPk(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      await product.update(req.body);

      const result = await Product.findByPk(product.id, {
        include: [{ model: Category, as: 'category' }]
      });

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/products/:id - Delete product (soft delete)
  static async delete(req, res, next) {
    try {
      const product = await Product.findByPk(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      await product.update({ is_active: false });

      res.json({
        success: true,
        message: 'Product deactivated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/products/categories - List all categories
  static async getCategories(req, res, next) {
    try {
      const categories = await Category.findAll({
        include: [{
          model: Product,
          as: 'products',
          attributes: ['id'],
          where: { is_active: true },
          required: false
        }],
        order: [['name', 'ASC']]
      });

      const result = categories.map(cat => ({
        ...cat.toJSON(),
        productCount: cat.products ? cat.products.length : 0,
        products: undefined
      }));

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductController;
