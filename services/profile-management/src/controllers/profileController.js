const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Address } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'ecommerce-microservices-jwt-secret-key-2024';

class ProfileController {

  // POST /api/profiles/register
  static async register(req, res, next) {
    try {
      const { first_name, last_name, email, password, phone } = req.body;
      if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ success: false, error: 'First name, last name, email, and password are required' });
      }

      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ success: false, error: 'Email already registered' });
      }

      const password_hash = await bcrypt.hash(password, 10);
      const user = await User.create({ first_name, last_name, email, password_hash, phone });

      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

      res.status(201).json({
        success: true,
        data: {
          user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role },
          token
        }
      });
    } catch (error) { next(error); }
  }

  // POST /api/profiles/login
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required' });
      }

      const user = await User.findOne({ where: { email } });
      if (!user || !user.is_active) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

      res.json({
        success: true,
        data: {
          user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role },
          token
        }
      });
    } catch (error) { next(error); }
  }

  // GET /api/profiles/:id
  static async getById(req, res, next) {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ['password_hash'] },
        include: [{ model: Address, as: 'addresses' }]
      });
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });
      res.json({ success: true, data: user });
    } catch (error) { next(error); }
  }

  // PUT /api/profiles/:id
  static async update(req, res, next) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });

      const { password, ...updates } = req.body;
      if (password) {
        updates.password_hash = await bcrypt.hash(password, 10);
      }
      await user.update(updates);

      const result = await User.findByPk(user.id, { attributes: { exclude: ['password_hash'] } });
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  // GET /api/profiles/:id/addresses
  static async getAddresses(req, res, next) {
    try {
      const addresses = await Address.findAll({ where: { user_id: req.params.id }, order: [['is_default', 'DESC']] });
      res.json({ success: true, data: addresses });
    } catch (error) { next(error); }
  }

  // POST /api/profiles/:id/addresses
  static async addAddress(req, res, next) {
    try {
      const { label, street, city, state, zip_code, country, is_default } = req.body;
      if (!street || !city || !zip_code) {
        return res.status(400).json({ success: false, error: 'Street, city, and zip_code are required' });
      }

      if (is_default) {
        await Address.update({ is_default: false }, { where: { user_id: req.params.id } });
      }

      const address = await Address.create({
        user_id: req.params.id, label, street, city, state, zip_code, country, is_default
      });
      res.status(201).json({ success: true, data: address });
    } catch (error) { next(error); }
  }
}

module.exports = ProfileController;
