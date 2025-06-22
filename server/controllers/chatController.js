const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Chat = require('../models/Chat'); // Импортируйте модель Chat
const User = require('../models/User'); // Импортируйте модель User
const { secret } = require('../config');

class ChatController {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map();

    this.wss.on('connection', (ws, req) => {
      const token = req.url.split('token=')[1] || req.headers['authorization']?.split(' ')[1];
      if (!token) {
        ws.close(1008, 'No token provided');
        return;
      }

      try {
        const decoded = jwt.verify(token, secret);
        const userId = decoded.id;

        // Проверка существования пользователя
        User.findById(userId)
          .then((user) => {
            if (!user) {
              ws.close(1008, 'User not found');
              return;
            }
            this.clients.set(userId, ws);
            ws.userId = userId;
          })
          .catch((e) => {
            ws.close(1008, 'Invalid token');
          });

        ws.on('message', async (message) => {
          try {
            console.log('Получено сообщение:', message.toString());
            const { recipientId, content } = JSON.parse(message);
            if (!recipientId || !content) {
              ws.send(JSON.stringify({ error: 'Missing recipientId or content' }));
              return;
            }

            // Проверка существования получателя
            const recipient = await User.findById(recipientId);
            if (!recipient) {
              ws.send(JSON.stringify({ error: 'Recipient not found' }));
              return;
            }

            // Найти или создать чат
            let chat = await Chat.findOne({
              $or: [
                { user_send: userId, user_get: recipientId },
                { user_send: recipientId, user_get: userId },
              ],
            });

            if (!chat) {
              chat = new Chat({
                user_send: userId,
                user_get: recipientId,
                lastMessage: { content, senderId: userId, sentAt: new Date() },
              });
              await chat.save();
            } else {
              chat.lastMessage = { content, senderId: userId, sentAt: new Date() };
              chat.updatedAt = new Date();
              await chat.save();
            }

            // Создать сообщение
            const newMessage = new Message({
              chatId: chat._id,
              senderId: userId,
              recipientId: recipientId,
              content,
            });
            await newMessage.save();

            // Заполнить данные отправителя и получателя
            const populatedMessage = await Message.findById(newMessage._id)
              .populate('senderId', 'username name')
              .populate('recipientId', 'username name');

            const messageData = {
              id: populatedMessage._id,
              sender: populatedMessage.senderId,
              recipient: populatedMessage.recipientId,
              content: populatedMessage.content,
              timestamp: populatedMessage.createdAt,
            };

            // Отправить сообщение отправителю
            if (this.clients.has(userId)) {
              this.clients.get(userId).send(JSON.stringify(messageData));
            }

            // Отправить сообщение получателю, если он подключен
            if (this.clients.has(recipientId)) {
              this.clients.get(recipientId).send(JSON.stringify(messageData));
            }
          } catch (e) {
            console.error('Error processing message:', e.stack);
            ws.send(JSON.stringify({ error: e.message || 'Error processing message' }));
          }
        });

        ws.on('close', () => {
          this.clients.delete(userId);
        });

        ws.on('error', (error) => {
          console.error('WebSocket error:', error);
          this.clients.delete(userId);
        });
      } catch (e) {
        ws.close(1008, 'Invalid token');
      }
    });
  }
}

module.exports = ChatController;