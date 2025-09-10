// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();
const path = require('path');

const app = express();

// ─── Middleware ────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000', // frontend URL from env
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── View engine (for admin panel/dashboard) ────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── Session (for admin panel login) ────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'bizbookadminsecret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    httpOnly: true, // helps prevent XSS
    secure: process.env.NODE_ENV === 'production', // true only with HTTPS
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  }
}));

// ─── Static files ────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── API Routes ────────────────────────────────
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/business', require('./routes/businessRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/owners', require('./routes/ownerRoutes'));
app.use('/admin', require('./routes/adminRoutes'));

// ─── Services route (fallback for filename differences) ────────────────────────────────
try {
  const serviceRoutes = require('./routes/serviceRoutes');
  app.use('/api/services', serviceRoutes);
} catch (err1) {
  try {
    const serviceRoutes = require('./routes/service');
    app.use('/api/services', serviceRoutes);
  } catch (err2) {
    console.warn('⚠ Service routes not found');
  }
}

// ─── Root route ────────────────────────────────
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: 'Segoe UI', sans-serif; text-align: center; margin-top: 100px;">
      <h1>🚀 BizBook Backend API Running ✅</h1>
      <p>Click below to go to the Admin Panel:</p>
      <a 
        href="/admin/login" 
        style="
          display: inline-block;
          margin-top: 20px;
          padding: 12px 25px;
          background-color: #3498db;
          color: #fff;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          transition: 0.3s;
        "
        onmouseover="this.style.backgroundColor='#2980b9'"
        onmouseout="this.style.backgroundColor='#3498db'"
      >
        Go to Admin Login
      </a>
      <p style="margin-top: 40px; color: #7f8c8d; font-size: 14px;">
        Backend API is running at <code>http://localhost:5100</code>
      </p>
    </div>
  `);
});

// ─── Health check ────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ─── MongoDB connection ────────────────────────────────
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bizbook';

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message));

// ─── 404 Handler ────────────────────────────────
app.use((req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ message: '⚠ 404 API Route Not Found' });
  }
  res.status(404).send('⚠ Page Not Found');
});

// ─── Global Error Handler ────────────────────────────────
app.use((err, req, res, next) => {
  console.error('🔥 Global error handler:', err.stack);
  res.status(500).json({ message: '⚠ Internal Server Error' });
});

// ─── Start server ────────────────────────────────
const PORT = process.env.PORT || 5100;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
