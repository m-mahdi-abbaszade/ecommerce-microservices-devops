const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');

router.post('/', OrderController.create);
router.get('/', OrderController.getAll);
router.get('/:id', OrderController.getById);
router.put('/:id/status', OrderController.updateStatus);
router.delete('/:id', OrderController.cancel);

module.exports = router;
