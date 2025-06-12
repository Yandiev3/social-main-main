const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require("../middlewares/authMiddleware")

router.post('/chats', authMiddleware, chatController.createOrGetChat);
router.post('/messages', authMiddleware, chatController.sendMessage);
router.get('/chats', authMiddleware, chatController.getUserChats);
router.get('/chats/:chatId', chatController.getChatToId);
router.post('/messages/read', chatController.readMessage);

module.exports = router;