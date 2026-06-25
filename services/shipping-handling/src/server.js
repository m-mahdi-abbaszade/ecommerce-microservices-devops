const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { sequelize } = require('./models');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'shipping-handling', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.use('/api/shipping', routes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: `Route ${req.originalUrl} not found` });
});

app.use(errorHandler);

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('[DB] PostgreSQL connection established');
    await sequelize.sync();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Shipping & Handling] Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('[Shipping & Handling] Failed to start:', error.message);
    process.exit(1);
  }
}

startServer();
module.exports = app;
