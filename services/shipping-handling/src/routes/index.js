const express = require('express');
const router = express.Router();
const ShippingController = require('../controllers/shippingController');

router.get('/methods', ShippingController.getMethods);
router.post('/shipments', ShippingController.createShipment);
router.get('/shipments/:id', ShippingController.getShipmentById);
router.get('/tracking/:trackingNumber', ShippingController.trackShipment);
router.put('/shipments/:id/status', ShippingController.updateStatus);

module.exports = router;
