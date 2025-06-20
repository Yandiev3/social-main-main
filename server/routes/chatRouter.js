const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');
const { secret } = require('../config');

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get chat history between two users
router.get('/history/:recipientId', authMiddleware, async (req, res) => {
  try {
    const { recipientId } = req.params;
    const userId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: recipientId },
        { sender: recipientId, recipient: userId },
      ],
    })
      .sort({ timestamp: 1 })
      .populate('sender', 'username name')
      .populate('recipient', 'username name');

    res.status(200).json(messages);
  } catch (e) {
    console.error('Error fetching chat history:', e);
    res.status(500).json({ message: 'Error fetching chat history' });
  }
});

module.exports = router;