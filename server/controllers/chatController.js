const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const { secret } = require('../config');

class ChatController {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map(); // Store WebSocket clients with user IDs

    this.wss.on('connection', (ws, req) => {
      // Extract token from query parameter or headers
      const token = req.url.split('token=')[1] || req.headers['authorization']?.split(' ')[1];
      if (!token) {
        ws.close(1008, 'No token provided');
        return;
      }

      try {
        const decoded = jwt.verify(token, secret);
        const userId = decoded.id;

        // Store the client with user ID
        this.clients.set(userId, ws);
        ws.userId = userId;

        ws.on('message', async (message) => {
          try {
            const { recipientId, content } = JSON.parse(message);
            if (!recipientId || !content) {
              ws.send(JSON.stringify({ error: 'Missing recipientId or content' }));
              return;
            }

            const newMessage = new Message({
              sender: userId,
              recipient: recipientId,
              content,
            });
            await newMessage.save();

            // Populate sender and recipient for response
            const populatedMessage = await Message.findById(newMessage._id)
              .populate('sender', 'username name')
              .populate('recipient', 'username name');

            // Send message to sender and recipient
            const messageData = {
              id: populatedMessage._id,
              sender: populatedMessage.sender,
              recipient: populatedMessage.recipient,
              content: populatedMessage.content,
              timestamp: populatedMessage.timestamp,
            };

            // Send to sender
            if (this.clients.has(userId)) {
              this.clients.get(userId).send(JSON.stringify(messageData));
            }

            // Send to recipient if they are connected
            if (this.clients.has(recipientId)) {
              this.clients.get(recipientId).send(JSON.stringify(messageData));
            }
          } catch (e) {
            console.error('Error processing message:', e);
            ws.send(JSON.stringify({ error: 'Error processing message' }));
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