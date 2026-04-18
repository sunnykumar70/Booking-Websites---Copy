require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const session = require('express-session');

const authRoutes = require('./routes/auth');
const dealRoutes = require('./routes/deals');
const bookingRoutes = require('./routes/bookings');
const ticketRoutes = require('./routes/tickets');
const adminRoutes = require('./routes/admin');
const chatbotRoutes = require('./routes/chatbot');
const storyRoutes = require('./routes/stories');
const destinationRoutes = require('./routes/destinations');
const passport = require('./passport');

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
}));
app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.JWT_SECRET || 'makeustrip_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Switch to true in production with HTTPS
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/upload', require('./routes/upload'));
app.use('/api/grouptrips', require('./routes/grouptrips'));
app.use('/api/payment', require('./routes/payment'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MakeUsTrip API is running' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
