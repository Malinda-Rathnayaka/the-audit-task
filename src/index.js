require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const siteRoutes = require('./routes/siteRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/sites', siteRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler - last middleware.
app.use((err, req, res, next) => {
  console.error(err);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    success: false,
    error: isProd ? 'Internal server error' : err.message,
    ...(isProd ? {} : { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5050;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Client Ops API listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });

module.exports = app;
