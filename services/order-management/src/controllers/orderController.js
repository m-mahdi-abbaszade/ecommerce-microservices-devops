const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { Order, OrderItem, sequelize } = require('../models');

const INVENTORY_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:3002';
const PROFILE_URL = process.env.PROFILE_SERVICE_URL || 'http://localhost:3004';
const SHIPPING_URL = process.env.SHIPPING_SERVICE_URL || 'http://localhost:3005';
const PRODUCT_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';

class OrderController {

  // POST /api/orders - Create order (orchestrates cross-service calls)
  static async create(req, res, next) {
    const t = await sequelize.transaction();
    try {
      const { user_id, items, shipping_address_id, shipping_method_id, notes } = req.body;

      if (!user_id || !items || items.length === 0) {
        await t.rollback();
        return res.status(400).json({ success: false, error: 'user_id and items are required' });
      }

      // 1. Get user address from Profile service
      let shippingAddress = null;
      try {
        const addrRes = await axios.get(`${PROFILE_URL}/api/profiles/${user_id}/addresses`);
        const addresses = addrRes.data.data;
        if (shipping_address_id) {
          shippingAddress = addresses.find(a => a.id === parseInt(shipping_address_id));
        }
        if (!shippingAddress && addresses.length > 0) {
          shippingAddress = addresses.find(a => a.is_default) || addresses[0];
        }
      } catch (err) {
        console.warn('[Order] Could not fetch address from Profile service, using provided address');
      }

      // 2. Reserve stock for each item via Inventory service
      const orderItems = [];
      let totalAmount = 0;

      for (const item of items) {
        // Reserve stock
        try {
          await axios.put(`${INVENTORY_URL}/api/inventory/${item.product_id}/reserve`, {
            quantity: item.quantity
          });
        } catch (err) {
          await t.rollback();
          return res.status(400).json({
            success: false,
            error: `Failed to reserve stock for product ${item.product_id}`,
            details: err.response?.data?.error || err.message
          });
        }

        // Get product info from Catalog service
        let productName = `Product #${item.product_id}`;
        let unitPrice = item.unit_price || 0;
        try {
          const prodRes = await axios.get(`${PRODUCT_URL}/api/products/${item.product_id}`);
          if (prodRes.data.data) {
            productName = prodRes.data.data.name;
            unitPrice = parseFloat(prodRes.data.data.price);
          }
        } catch (err) {
          console.warn(`[Order] Could not fetch product ${item.product_id} info`);
        }

        const totalPrice = unitPrice * item.quantity;
        totalAmount += totalPrice;

        orderItems.push({
          product_id: item.product_id,
          product_name: productName,
          quantity: item.quantity,
          unit_price: unitPrice,
          total_price: totalPrice
        });
      }

      // 3. Create shipment via Shipping service
      let shipmentId = null;
      try {
        const shipRes = await axios.post(`${SHIPPING_URL}/api/shipping/shipments`, {
          order_number: `PENDING-${Date.now()}`,
          shipping_method_id: shipping_method_id || 1,
          destination_address: shippingAddress
            ? `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip_code}`
            : 'Address TBD'
        });
        shipmentId = shipRes.data.data?.id;
      } catch (err) {
        console.warn('[Order] Could not create shipment, continuing without');
      }

      // 4. Create the order
      const orderNumber = `ORD-${uuidv4().slice(0, 8).toUpperCase()}`;
      const order = await Order.create({
        user_id,
        order_number: orderNumber,
        status: 'confirmed',
        total_amount: totalAmount,
        shipping_address: shippingAddress
          ? `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip_code}, ${shippingAddress.country}`
          : null,
        shipping_method_id: shipping_method_id || 1,
        shipment_id: shipmentId,
        notes
      }, { transaction: t });

      // 5. Create order items
      for (const item of orderItems) {
        await OrderItem.create({ ...item, order_id: order.id }, { transaction: t });
      }

      await t.commit();

      // 6. Return full order
      const result = await Order.findByPk(order.id, {
        include: [{ model: OrderItem, as: 'items' }]
      });

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: result,
        serviceCalls: {
          inventoryReserved: orderItems.length,
          shipmentCreated: !!shipmentId,
          addressFetched: !!shippingAddress
        }
      });

    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  // GET /api/orders
  static async getAll(req, res, next) {
    try {
      const { user_id, status, page = 1, limit = 10 } = req.query;
      const where = {};
      if (user_id) where.user_id = user_id;
      if (status) where.status = status;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const { count, rows } = await Order.findAndCountAll({
        where,
        include: [{ model: OrderItem, as: 'items' }],
        limit: parseInt(limit),
        offset,
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: rows,
        pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) }
      });
    } catch (error) { next(error); }
  }

  // GET /api/orders/:id
  static async getById(req, res, next) {
    try {
      const order = await Order.findByPk(req.params.id, {
        include: [{ model: OrderItem, as: 'items' }]
      });
      if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
      res.json({ success: true, data: order });
    } catch (error) { next(error); }
  }

  // PUT /api/orders/:id/status
  static async updateStatus(req, res, next) {
    try {
      const order = await Order.findByPk(req.params.id);
      if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
      await order.update({ status: req.body.status });
      res.json({ success: true, data: order });
    } catch (error) { next(error); }
  }

  // DELETE /api/orders/:id - Cancel order (releases inventory)
  static async cancel(req, res, next) {
    try {
      const order = await Order.findByPk(req.params.id, {
        include: [{ model: OrderItem, as: 'items' }]
      });
      if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

      if (['delivered', 'shipped'].includes(order.status)) {
        return res.status(400).json({ success: false, error: 'Cannot cancel a delivered/shipped order' });
      }

      // Release inventory for each item
      for (const item of order.items) {
        try {
          await axios.put(`${INVENTORY_URL}/api/inventory/${item.product_id}/release`, {
            quantity: item.quantity
          });
        } catch (err) {
          console.warn(`[Order] Could not release stock for product ${item.product_id}`);
        }
      }

      await order.update({ status: 'cancelled' });
      res.json({ success: true, message: 'Order cancelled, inventory released', data: order });
    } catch (error) { next(error); }
  }
}

module.exports = OrderController;
