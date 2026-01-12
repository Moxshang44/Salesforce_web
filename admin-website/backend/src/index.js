import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import companiesRouter from './routes/companies.js';
import ledgersRouter from './routes/ledgers.js';
import vouchersRouter from './routes/vouchers.js';
import stockRouter from './routes/stock.js';
import reportsRouter from './routes/reports.js';
import salesOrdersRouter from './routes/salesOrders.js';

const app = express();

// Middleware
app.use(cors({ origin: config.server.corsOrigin }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Tally Connector API is running' });
});

// Routes
app.use('/api/companies', companiesRouter);
app.use('/api/ledgers', ledgersRouter);
app.use('/api/vouchers', vouchersRouter);
app.use('/api/stock', stockRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/sales-orders', salesOrdersRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(config.server.port, () => {
  console.log(`🚀 Tally Connector API running on http://localhost:${config.server.port}`);
  console.log(`📊 Tally Server: ${config.tally.url}`);
  console.log(`🌐 CORS enabled for: ${config.server.corsOrigin}`);
});

