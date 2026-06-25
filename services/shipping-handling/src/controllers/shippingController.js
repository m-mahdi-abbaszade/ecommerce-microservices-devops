const { v4: uuidv4 } = require('uuid');
const { ShippingMethod, Shipment } = require('../models');

class ShippingController {

  // GET /api/shipping/methods
  static async getMethods(req, res, next) {
    try {
      const methods = await ShippingMethod.findAll({ where: { is_active: true }, order: [['base_price', 'ASC']] });
      res.json({ success: true, data: methods });
    } catch (error) { next(error); }
  }

  // POST /api/shipping/shipments
  static async createShipment(req, res, next) {
    try {
      const { order_number, shipping_method_id, destination_address, weight_kg } = req.body;
      const method = await ShippingMethod.findByPk(shipping_method_id || 1);
      if (!method) return res.status(400).json({ success: false, error: 'Invalid shipping method' });

      const estimated_delivery = new Date();
      estimated_delivery.setDate(estimated_delivery.getDate() + method.estimated_days);

      const tracking_number = `TRK-${uuidv4().slice(0, 12).toUpperCase()}`;
      const shipment = await Shipment.create({
        tracking_number, order_number, shipping_method_id: method.id,
        status: 'pending', destination_address, estimated_delivery, weight_kg
      });

      const result = await Shipment.findByPk(shipment.id, {
        include: [{ model: ShippingMethod, as: 'method' }]
      });

      res.status(201).json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  // GET /api/shipping/shipments/:id
  static async getShipmentById(req, res, next) {
    try {
      const shipment = await Shipment.findByPk(req.params.id, {
        include: [{ model: ShippingMethod, as: 'method' }]
      });
      if (!shipment) return res.status(404).json({ success: false, error: 'Shipment not found' });
      res.json({ success: true, data: shipment });
    } catch (error) { next(error); }
  }

  // GET /api/shipping/tracking/:trackingNumber
  static async trackShipment(req, res, next) {
    try {
      const shipment = await Shipment.findOne({
        where: { tracking_number: req.params.trackingNumber },
        include: [{ model: ShippingMethod, as: 'method' }]
      });
      if (!shipment) return res.status(404).json({ success: false, error: 'Shipment not found' });

      const statusHistory = [
        { status: 'pending', timestamp: shipment.created_at },
        ...(shipment.status !== 'pending' ? [{ status: 'processing', timestamp: shipment.updated_at }] : []),
        ...(shipment.status === 'shipped' ? [{ status: 'shipped', timestamp: shipment.updated_at }] : []),
        ...(shipment.status === 'delivered' ? [
          { status: 'shipped', timestamp: shipment.created_at },
          { status: 'delivered', timestamp: shipment.actual_delivery }
        ] : [])
      ];

      res.json({
        success: true,
        data: {
          tracking_number: shipment.tracking_number,
          current_status: shipment.status,
          estimated_delivery: shipment.estimated_delivery,
          actual_delivery: shipment.actual_delivery,
          method: shipment.method?.name,
          destination: shipment.destination_address,
          history: statusHistory
        }
      });
    } catch (error) { next(error); }
  }

  // PUT /api/shipping/shipments/:id/status
  static async updateStatus(req, res, next) {
    try {
      const shipment = await Shipment.findByPk(req.params.id);
      if (!shipment) return res.status(404).json({ success: false, error: 'Shipment not found' });

      const updates = { status: req.body.status };
      if (req.body.status === 'delivered') updates.actual_delivery = new Date();
      await shipment.update(updates);

      res.json({ success: true, data: shipment });
    } catch (error) { next(error); }
  }
}

module.exports = ShippingController;
