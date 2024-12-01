const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/adminMiddleware');

// Example admin route
router.get('/admin-only', isAdmin, (req, res) => {
  res.json({ message: 'Welcome, admin!' });
});

module.exports = router; 