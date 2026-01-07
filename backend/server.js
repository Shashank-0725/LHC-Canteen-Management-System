// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const { PORT } = require('./config/env');
const connectDB = require('./config/db');


const authRoutes = require('./routes/auth.routes');
const menuRoutes = require('./routes/menu.routes');
const orderRoutes = require('./routes/order.routes');
const statsRoutes = require('./routes/stats.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes);


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BVB Canteen backend running' });
});

// Serve static files from the frontend directory
// Since server.js is in backend/, we go up one level then into frontend/
// PRO TIP: Block access to the backend folder itself for security
app.use('/backend', (req, res) => res.status(403).send('Forbidden'));
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Handle SPA-like routing (optional but good)
// Send index.html for any unknown routes (that aren't /api)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
  }
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
