const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('../config/dbConfig'); // MongoDB connection
const authRoutes = require('./routes/authRoutes'); // Importing auth routes
const greetingsRoutes = require('./routes/greetingsRoutes'); // Importing greetings routes
const Greeting = require('./models/Greeting'); // Import Greeting model
const adminRoutes = require('./routes/adminRoutes'); // Import admin routes

require("dotenv").config(); // Load environment variables

const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
  credentials: true, // Allow credentials (if needed)
}));
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);  // Auth routes: /api/auth/register and /api/auth/login
app.use('/api/greetings', greetingsRoutes);  // Greetings routes: /api/greetings
app.use('/api/admin', adminRoutes); // Add admin routes

// // Connect to MongoDB
// connectDB(); // Assuming connectDB is in config/dbConfig.js

// Schedule the cron job to expire greetings
cron.schedule('0 * * * *', async () => { // Runs every hour (0th minute)
  try {
    const now = new Date();
    console.log(`Current time: ${now}`);

    // Find pending greetings that need to be expired
    const pendingGreetings = await Greeting.find({ expiresAt: { $lt: now }, status: 'pending' });
    console.log('Pending greetings to expire:', pendingGreetings);

    // Mark those greetings as expired
    const result = await Greeting.updateMany(
      { expiresAt: { $lt: now }, status: 'pending' },
      { $set: { status: 'expired' } }
    );

    console.log(`Matching documents: ${result.matchedCount}`);
    console.log(`Modified documents: ${result.modifiedCount}`);
    console.log(`${result.nModified} messages marked as expired.`);
  } catch (error) {
    console.error('Error updating expired messages:', error);
  }
});

// Connect to MongoDB and start the server
mongoose.connect(process.env.MONGO_URI)  
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.log('MongoDB connection error:', err);
  });

module.exports = app;  // Export app for testing or future configurations
