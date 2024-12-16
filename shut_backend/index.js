const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: 'https://auto-shutdown-zgsd.vercel.app/',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.mongodb_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema with Shutdown State
const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  uniqueId: { type: String, required: true, unique: true },
  shutdown: { type: Boolean, default: false }, // Shutdown state
}));

// Register Endpoint
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const uniqueId = uuidv4();

  try {
    const user = new User({ username, password, uniqueId });
    await user.save();
    res.json({ uniqueId });
  } catch (error) {
    res.status(500).send('Error registering user');
  }
});

// Login Endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).send('Invalid credentials');
    res.json({ uniqueId: user.uniqueId });
  } catch (error) {
    res.status(500).send('Error logging in');
  }
});

// Toggle Shutdown State
app.post('/toggle-shutdown', async (req, res) => {
  const { uniqueId, shutdown } = req.body;

  try {
    const user = await User.findOne({ uniqueId });
    if (!user) return res.status(404).send('User not found.');

    // Update shutdown state
    user.shutdown = shutdown;
    await user.save();
    res.json({ message: 'Shutdown state updated', shutdown });

    console.log(`Shutdown set to ${shutdown} for user ${uniqueId}`);

    // Auto-reset shutdown to false after 1 minute
    if (shutdown) {
      setTimeout(async () => {
        user.shutdown = false;
        await user.save();
        console.log(`Shutdown reset to false for user ${uniqueId}`);
      }, 60000); // 1 minute = 60000 ms
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error toggling shutdown state.');
  }
});

// Get Shutdown State
app.get('/get-shutdown/:uniqueId', async (req, res) => {
  const { uniqueId } = req.params;
  console.log(`Fetching shutdown state for user ${uniqueId}`);

  try {
    const user = await User.findOne({ uniqueId });
    if (!user) return res.status(404).send('User not found.');

    res.json({ shutdown: user.shutdown });
  } catch (error) {
    res.status(500).send('Error fetching shutdown state.');
  }
});

// Start the Server
app.listen(5000, () => {
  console.log('Server running on http://192.168.137.8:5000');
});
