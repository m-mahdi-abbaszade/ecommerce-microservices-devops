const express = require('express');
const router = express.Router();
const ProfileController = require('../controllers/profileController');

router.post('/register', ProfileController.register);
router.post('/login', ProfileController.login);
router.get('/:id', ProfileController.getById);
router.put('/:id', ProfileController.update);
router.get('/:id/addresses', ProfileController.getAddresses);
router.post('/:id/addresses', ProfileController.addAddress);

module.exports = router;
