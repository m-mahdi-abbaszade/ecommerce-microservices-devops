const { Ticket, TicketMessage } = require('../models');

class SupportController {

  // POST /api/support/tickets
  static async create(req, res, next) {
    try {
      const { user_id, subject, category, priority, message } = req.body;
      if (!subject) return res.status(400).json({ success: false, error: 'Subject is required' });

      const ticket = await Ticket.create({ user_id, subject, category, priority });

      if (message) {
        await TicketMessage.create({ ticket_id: ticket.id, sender: 'customer', message });
      }

      const result = await Ticket.findByPk(ticket.id, {
        include: [{ model: TicketMessage, as: 'messages' }]
      });

      res.status(201).json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  // GET /api/support/tickets
  static async getAll(req, res, next) {
    try {
      const { user_id, status } = req.query;
      const where = {};
      if (user_id) where.user_id = user_id;
      if (status) where.status = status;

      const tickets = await Ticket.findAll({
        where,
        include: [{ model: TicketMessage, as: 'messages', attributes: ['id', 'created_at'] }],
        order: [['created_at', 'DESC']]
      });
      res.json({ success: true, data: tickets });
    } catch (error) { next(error); }
  }

  // GET /api/support/tickets/:id
  static async getById(req, res, next) {
    try {
      const ticket = await Ticket.findByPk(req.params.id, {
        include: [{ model: TicketMessage, as: 'messages', order: [['created_at', 'ASC']] }]
      });
      if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });
      res.json({ success: true, data: ticket });
    } catch (error) { next(error); }
  }

  // PUT /api/support/tickets/:id
  static async update(req, res, next) {
    try {
      const ticket = await Ticket.findByPk(req.params.id);
      if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });

      await ticket.update(req.body);
      res.json({ success: true, data: ticket });
    } catch (error) { next(error); }
  }

  // PUT /api/support/tickets/:id/status
  static async updateStatus(req, res, next) {
    try {
      const ticket = await Ticket.findByPk(req.params.id);
      if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });

      await ticket.update({ status: req.body.status });
      res.json({ success: true, data: ticket });
    } catch (error) { next(error); }
  }

  // POST /api/support/tickets/:id/messages
  static async addMessage(req, res, next) {
    try {
      const ticket = await Ticket.findByPk(req.params.id);
      if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });

      const { sender, message } = req.body;
      if (!message) return res.status(400).json({ success: false, error: 'Message is required' });

      const msg = await TicketMessage.create({
        ticket_id: ticket.id, sender: sender || 'customer', message
      });
      res.status(201).json({ success: true, data: msg });
    } catch (error) { next(error); }
  }
}

module.exports = SupportController;
