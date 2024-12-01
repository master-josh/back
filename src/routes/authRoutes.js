// routes/authRoutes.js

const express = require('express');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();
// Register route
router.post('/register', authController.register); 

// Login route
router.post('/login', authController.login); 

router.get('/user', authenticate, authController.getUser);

module.exports = router;
