require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const { startKeepAlive } = require('./keepAlive');

// ── Route imports ─────────────────────────────────────────────────────────────
const registerRoute  = require('./routes/register');
const paymentRoute   = require('./routes/payment');
const ticketsRoute   = require('./routes/tickets');
const recoverRoute   = require('./routes/recover');
const adminRoute     = require('./routes/admin');

// ── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'https://jitoeventadmin.vercel.app',
  'http://localhost:5174',
  'http://localhost:3000',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`CORS blocked request from origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ── Public routes ─────────────────────────────────────────────────────────────
app.use('/api/register',       registerRoute);
app.use('/api/verify-payment', paymentRoute);
app.use('/api',                ticketsRoute);   // /api/order/:id/tickets, /api/ticket/:id, /api/order/:id/download
app.use('/api/recover-ticket', recoverRoute);

// ── Admin routes (all protected by adminAuth middleware inside the router) ─────
app.use('/api/admin',          adminRoute);     // /api/admin/stats, /api/admin/all-tickets
app.use('/api',                adminRoute);     // /api/validate-ticket (also uses adminAuth)

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '6000', 10);
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);
  startKeepAlive();
});