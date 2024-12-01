const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Make sure to install jsonwebtoken
const User = require('../models/User');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      username: user.username,
      role: user.role
    }, 
    process.env.JWT_SECRET, // Make sure to set this in your .env file
    { expiresIn: '1d' } // Token expires in 1 day
  );
};

// Controller for user registration
const register = async (req, res) => {
  console.log('Received registration data:', req.body);

  // Destructure and validate request body
  const { email, password, username, role } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email or username already exists' 
      });
    }

    // Create and save the new user
    const newUser = new User({
      email,
      password, // The pre-save middleware in the model will hash this
      username,
      role: role || 'user'
    });

    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser);

    // Respond with success and token
    return res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      details: error.message 
    });
  }
};

// Controller for user login
const login = async (req, res) => {
  console.log('Login attempt:', req.body);

  // Destructure request body
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Check if the user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Respond with success, token, and user details
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      details: error.message 
    });
  }
};

const getUser = async (req, res) => {
  try {
    // Fetch the user from the database
    const user = await User.findById(req.user.id).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user); // Send user details
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


module.exports = { register, login, getUser};