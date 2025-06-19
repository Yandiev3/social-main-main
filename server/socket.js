// socket.js
const { Server } = require('socket.io');
const Chat = require('./models/Chat');
const Message = require('./models/Message');
const User = require('./models/User');

let io = null;
const activeUsers = new Map();

module.exports = {
  init: (server) => {
    io = new Server(server, {
      cors: {
        origin: '*', // В продакшене замените на конкретный URL фронтенда
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('Клиент подключился:', socket.id);

      // Подключение пользователя и обновление статуса
      // socket.js
socket.on('user_online', async (userId) => {
  if (!userId || typeof userId !== 'string' || !mongoose.Types.ObjectId.isValid(userId)) {
    socket.emit('error', { message: 'Invalid or missing userId' });
    return;
  }

  socket.userId = userId;
  socket.join(userId);
  activeUsers.set(userId, {
    socketId: socket.id,
    lastSeen: new Date(),
    isOnline: true,
  });

  await User.findByIdAndUpdate(userId, {
    isOnline: true,
    lastSeen: new Date(),
  });

  io.emit('user_status', { userId, isOnline: true });
});

      // Проверка статуса другого пользователя
      socket.on('check_user_status', (userId) => {
        const user = activeUsers.get(userId);
        const status = user
          ? { userId, isOnline: user.isOnline, lastSeen: user.lastSeen }
          : { userId, isOnline: false, lastSeen: null };
        socket.emit('user_status', status);
      });

      // Присоединение к комнате чата
      socket.on('joinChat', ({ chatId }) => {
        socket.join(chatId);
        console.log(`Пользователь ${socket.userId} присоединился к чату ${chatId}`);
      });

      // Покинуть комнату чата
      socket.on('leaveChat', ({ chatId }) => {
        socket.leave(chatId);
        console.log(`Пользователь ${socket.userId} покинул чат ${chatId}`);
      });

      // Отправка сообщения
      socket.on('sendMessage', async ({ chatId, senderId, recipientId, content }) => {
        try {
          // Проверка существования чата
          const chat = await Chat.findById(chatId);
          if (!chat) {
            socket.emit('error', { message: 'Чат не найден' });
            return;
          }

          // Создание и сохранение сообщения
          const message = new Message({
            chatId,
            senderId,
            recipientId,
            content,
            isRead: false,
            createdAt: new Date(),
          });
          await message.save();

          // Обновление чата
          const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            {
              updatedAt: new Date(),
              lastMessage: {
                content,
                senderId,
                isRead: false,
                sentAt: new Date(),
              },
            },
            { new: true }
          )
            .populate('lastMessage.senderId', 'avatar name lastname')
            .populate('user_send', 'avatar name lastname')
            .populate('user_get', 'avatar name lastname');

          // Отправка сообщения в комнату чата
          io.to(chatId).emit('newMessage', message);
          // Обновление чата для участников
          io.to(senderId).emit('chatUpdated', updatedChat);
          io.to(recipientId).emit('chatUpdated', updatedChat);
        } catch (error) {
          console.error('Ошибка при отправке сообщения:', error);
          socket.emit('error', { message: 'Ошибка при отправке сообщения' });
        }
      });

      // Пометка сообщений как прочитанных
      socket.on('messageRead', async ({ chatId, messageIds, recipientId }) => {
        try {
          await Message.updateMany(
            {
              _id: { $in: messageIds },
              chatId,
              recipientId,
              isRead: false,
            },
            { $set: { isRead: true } }
          );

          const lastMessage = await Message.findOne({ chatId })
            .sort({ createdAt: -1 })
            .limit(1);

          if (lastMessage) {
            await Chat.findByIdAndUpdate(chatId, {
              lastMessage: {
                content: lastMessage.content,
                senderId: lastMessage.senderId,
                isRead: lastMessage.isRead,
                sentAt: lastMessage.createdAt,
              },
            });
          }

          io.to(chatId).emit('messagesRead', { chatId, messageIds });
        } catch (error) {
          console.error('Ошибка при пометке сообщений как прочитанных:', error);
          socket.emit('error', { message: 'Ошибка при пометке сообщений' });
        }
      });

      // Периодическое обновление lastSeen
      const heartbeatInterval = setInterval(async () => {
        if (socket.userId) {
          await User.findByIdAndUpdate(socket.userId, {
            lastSeen: new Date(),
          });
        }
      }, 30000);

      // Обработка отключения
      socket.on('disconnect', async () => {
        clearInterval(heartbeatInterval);
        if (socket.userId) {
          activeUsers.delete(socket.userId);
          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            lastSeen: new Date(),
          });
          io.emit('user_status', {
            userId: socket.userId,
            isOnline: false,
          });
          console.log(`Пользователь ${socket.userId} отключился`);
        }
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) throw new Error('Socket.io не инициализирован!');
    return io;
  },

  getUserStatus: (userId) => {
    const user = activeUsers.get(userId);
    return user
      ? { isOnline: user.isOnline, lastSeen: user.lastSeen }
      : { isOnline: false, lastSeen: null };
  },
};