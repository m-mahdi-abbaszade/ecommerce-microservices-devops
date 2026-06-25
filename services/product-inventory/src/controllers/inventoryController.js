const { Inventory, sequelize } = require('../models');

class InventoryController {

  // GET /api/inventory
  static async getAll(req, res, next) {
    try {
      const inventory = await Inventory.findAll({ order: [['product_id', 'ASC']] });
      res.json({ success: true, data: inventory });
    } catch (error) { next(error); }
  }

  // GET /api/inventory/:productId
  static async getByProductId(req, res, next) {
    try {
      const inventory = await Inventory.findOne({ where: { product_id: req.params.productId } });
      if (!inventory) {
        return res.status(404).json({ success: false, error: 'Inventory record not found' });
      }
      res.json({ success: true, data: inventory });
    } catch (error) { next(error); }
  }

  // POST /api/inventory
  static async create(req, res, next) {
    try {
      const { product_id, quantity_in_stock, reorder_level, warehouse_location } = req.body;
      if (!product_id) {
        return res.status(400).json({ success: false, error: 'product_id is required' });
      }
      const inventory = await Inventory.create({
        product_id, quantity_in_stock, reorder_level, warehouse_location
      });
      res.status(201).json({ success: true, data: inventory });
    } catch (error) { next(error); }
  }

  // PUT /api/inventory/:productId/reserve - Reserve stock
  static async reserve(req, res, next) {
    const t = await sequelize.transaction();
    try {
      const { quantity = 1 } = req.body;
      const inventory = await Inventory.findOne({
        where: { product_id: req.params.productId },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!inventory) {
        await t.rollback();
        return res.status(404).json({ success: false, error: 'Product not found in inventory' });
      }

      const available = inventory.quantity_in_stock - inventory.quantity_reserved;
      if (available < quantity) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          error: 'Insufficient stock',
          available,
          requested: quantity
        });
      }

      inventory.quantity_reserved += quantity;
      await inventory.save({ transaction: t });
      await t.commit();

      res.json({
        success: true,
        message: `Reserved ${quantity} unit(s)`,
        data: inventory
      });
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  // PUT /api/inventory/:productId/release - Release reserved stock
  static async release(req, res, next) {
    const t = await sequelize.transaction();
    try {
      const { quantity = 1 } = req.body;
      const inventory = await Inventory.findOne({
        where: { product_id: req.params.productId },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!inventory) {
        await t.rollback();
        return res.status(404).json({ success: false, error: 'Product not found in inventory' });
      }

      if (inventory.quantity_reserved < quantity) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          error: 'Cannot release more than reserved',
          reserved: inventory.quantity_reserved,
          requested: quantity
        });
      }

      inventory.quantity_reserved -= quantity;
      inventory.quantity_in_stock -= quantity;
      await inventory.save({ transaction: t });
      await t.commit();

      res.json({
        success: true,
        message: `Released ${quantity} unit(s)`,
        data: inventory
      });
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  // PUT /api/inventory/:productId - Update inventory
  static async update(req, res, next) {
    try {
      const inventory = await Inventory.findOne({ where: { product_id: req.params.productId } });
      if (!inventory) {
        return res.status(404).json({ success: false, error: 'Inventory record not found' });
      }
      await inventory.update(req.body);
      res.json({ success: true, data: inventory });
    } catch (error) { next(error); }
  }
}

module.exports = InventoryController;
