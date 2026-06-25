const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/inventoryController');

router.get('/', InventoryController.getAll);
router.get('/:productId', InventoryController.getByProductId);
router.post('/', InventoryController.create);
router.put('/:productId/reserve', InventoryController.reserve);
router.put('/:productId/release', InventoryController.release);
router.put('/:productId', InventoryController.update);

module.exports = router;
