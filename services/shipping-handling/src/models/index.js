const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'shipping_handling',
  process.env.DB_USER || 'shipping_user',
  process.env.DB_PASSWORD || 'shipping_pass',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'production' ? false : console.log,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
  }
);

const ShippingMethod = sequelize.define('ShippingMethod', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT },
  base_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  estimated_days: { type: DataTypes.INTEGER, allowNull: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'shipping_methods',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

const Shipment = sequelize.define('Shipment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tracking_number: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  order_number: { type: DataTypes.STRING(50) },
  shipping_method_id: { type: DataTypes.INTEGER },
  status: { type: DataTypes.STRING(30), defaultValue: 'pending' },
  destination_address: { type: DataTypes.TEXT },
  estimated_delivery: { type: DataTypes.DATE },
  actual_delivery: { type: DataTypes.DATE },
  weight_kg: { type: DataTypes.DECIMAL(6, 2) }
}, {
  tableName: 'shipments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

ShippingMethod.hasMany(Shipment, { foreignKey: 'shipping_method_id', as: 'shipments' });
Shipment.belongsTo(ShippingMethod, { foreignKey: 'shipping_method_id', as: 'method' });

module.exports = { sequelize, ShippingMethod, Shipment };
