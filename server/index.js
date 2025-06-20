const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRouter = require('./routes/authRouter');
const postRouter = require('./routes/postRouter');
const chatRouter = require('./routes/chatRouter');
const ChatController = require('./controllers/chatController');
const http = require('http');

const PORT = process.env.PORT || 5000;
const app = express({ limit: '100mb' });
const server = http.createServer(app); // Create HTTP server for WebSocket

// Initialize WebSocket server
new ChatController(server);

app.use(cors());
app.use(express.json());
app.use('/auth', authRouter);
app.use('/uploads', express.static('uploads'));
app.use('/post', postRouter);
app.use('/chat', chatRouter);

const start = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/');
    server.listen(PORT, () => {
      console.clear();
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
};

start();