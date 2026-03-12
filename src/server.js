'use strict';

require('dotenv').config();

const express = require('express');
const bookRoutes = require('./routes/books');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'RESTful API Katalog Buku berjalan dengan baik 📚',
    version: '1.0.0',
  });
});

// Routes
app.use('/api/books', bookRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: `Route ${req.method} ${req.path} tidak ditemukan.` });
});

// Global error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Terjadi kesalahan internal pada server.' });
});

// Jalankan server hanya jika bukan mode test
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
