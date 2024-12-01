const User = require('../models/User');

// Middleware to check if the user is an admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id); // Assuming user info is attached to req.user
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied, admin only' });
    }
    next(); // User is admin, proceed to the next middleware
  } catch (error) {
    console.error('Error checking admin role:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { isAdmin }; 