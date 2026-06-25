const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'contact_support',
  process.env.DB_USER || 'support_user',
  process.env.DB_PASSWORD || 'support_pass',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'production' ? false : console.log,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
  }
);

const Ticket = sequelize.define('Ticket', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER },
  subject: { type: DataTypes.STRING(255), allowNull: false },
  category: { type: DataTypes.STRING(50), defaultValue: 'general' },
  status: { type: DataTypes.STRING(30), defaultValue: 'open' },
  priority: { type: DataTypes.STRING(20), defaultValue: 'medium' }
}, {
  tableName: 'tickets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const TicketMessage = sequelize.define('TicketMessage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ticket_id: { type: DataTypes.INTEGER, allowNull: false },
  sender: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'customer' },
  message: { type: DataTypes.TEXT, allowNull: false }
}, {
  tableName: 'ticket_messages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

Ticket.hasMany(TicketMessage, { foreignKey: 'ticket_id', as: 'messages' });
TicketMessage.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });

module.exports = { sequelize, Ticket, TicketMessage };
