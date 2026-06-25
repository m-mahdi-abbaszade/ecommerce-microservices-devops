const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { sequelize } = require('./models');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// ─── Health Check ───
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'product-catalog',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ─── API Routes ───
app.use('/api/products', routes);

// ─── 404 Handler ───
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// ─── Error Handler ───
app.use(errorHandler);

// ─── Start Server ───
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('[DB] PostgreSQL connection established');

    await sequelize.sync();
    console.log('[DB] Models synchronized');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Product Catalog] Service running on port ${PORT}`);
      console.log(`[Product Catalog] Health: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('[Product Catalog] Failed to start:', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
