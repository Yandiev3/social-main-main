let io = null;
const Chat = require("./models/Chat");
const User = require("./models/User");
const activeUsers = new Map();

module.exports = {
  init: (server) => {
    const { Server } = require("socket.io");
    io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      socket.on("user_online", async (userId) => {
        socket.userId = userId;

        activeUsers.set(userId, {
          socketId: socket.id,
          lastSeen: new Date(),
          isOnline: true,
        });

        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: new Date(),
        });

        io.emit("user_status", { userId, isOnline: true });
      });

      socket.on("check_user_status", (userId) => {
        const user = activeUsers.get(userId);
        const isOnline = user ? user.isOnline : false;

        socket.emit("user_status", { userId, isOnline });
      });
      socket.on("joinRoom", (chatId) => {
        socket.join(chatId);
      });

      socket.on("newMessage", (message) => {
        io.to(message.chatId).emit("newMessage", message);
      });

      socket.on("joinUserRoom", (userId) => {
        socket.join(userId);
      });

      socket.on("messageRead", async ({ chatId, messageId, recipientId }) => {
        await Chat.findByIdAndUpdate(chatId, {
          $set: {
            "lastMessage.isRead": true,
          },
        });

        io.to(chatId).emit("messageRead", { messageId, chatId });
      });

      const heartbeatInterval = setInterval(async () => {
        if (socket.userId) {
          await User.findByIdAndUpdate(socket.userId, {
            lastSeen: new Date(),
          });
        }
      }, 30000);

      socket.on("disconnect", async () => {
        clearInterval(heartbeatInterval);

        if (socket.userId) {
          activeUsers.delete(socket.userId);
          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            lastSeen: new Date(),
          });

          io.emit("user_status", {
            userId: socket.userId,
            isOnline: false,
          });
        }
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) throw new Error("Socket.io не инициализирован!");
    return io;
  },

  getUserStatus: (userId) => {
    const user = activeUsers.get(userId);
    return user
      ? { isOnline: user.isOnline, lastSeen: user.lastSeen }
      : { isOnline: false, lastSeen: null };
  },
};
