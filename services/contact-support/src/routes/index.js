const express = require('express');
const router = express.Router();
const SupportController = require('../controllers/supportController');

router.post('/tickets', SupportController.create);
router.get('/tickets', SupportController.getAll);
router.get('/tickets/:id', SupportController.getById);
router.put('/tickets/:id', SupportController.update);
router.put('/tickets/:id/status', SupportController.updateStatus);
router.post('/tickets/:id/messages', SupportController.addMessage);

module.exports = router;
