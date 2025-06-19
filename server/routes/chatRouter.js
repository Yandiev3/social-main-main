const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require("../middlewares/authMiddleware")

router.post('/chats', authMiddleware, chatController.createOrGetChat);
router.post('/messages', authMiddleware, chatController.sendMessage);
router.get('/chats', authMiddleware, chatController.getUserChats);
router.get('/chats/:chatId', authMiddleware, chatController.getChatToId);
router.post('/messages/read', authMiddleware, chatController.readMessage);

router.get('/between/:user1Id/:user2Id', authMiddleware, chatController.getChatBetweenUsers);


module.exports = router;