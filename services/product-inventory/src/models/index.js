const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'product_inventory',
  process.env.DB_USER || 'inventory_user',
  process.env.DB_PASSWORD || 'inventory_pass',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'production' ? false : console.log,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
  }
);

const Inventory = sequelize.define('Inventory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  product_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  quantity_in_stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  quantity_reserved: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  reorder_level: { type: DataTypes.INTEGER, defaultValue: 10 },
  warehouse_location: { type: DataTypes.STRING(100) },
  last_restocked: { type: DataTypes.DATE }
}, {
  tableName: 'inventory',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = { sequelize, Inventory };
