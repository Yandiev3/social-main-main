const Chat = require("../models/Chat");
const Message = require("../models/message");
const User = require("../models/User");

const { getIO } = require("../socket");

class chatController {
  async createOrGetChat(req, res) {
    try {
      const { user_send, user_get } = req.body;
      
      // Проверка на существование пользователей
      const [userSend, userGet] = await Promise.all([
        User.findById(user_send),
        User.findById(user_get)
      ]);
      
      if (!userSend || !userGet) {
        return res.status(404).json({ error: "Один из пользователей не найден" });
      }

      // Ищем существующий чат в обоих направлениях
      let chat = await Chat.findOne({
        $or: [
          { user_send, user_get },
          { user_send: user_get, user_get: user_send }
        ]
      }).populate('user_send user_get', 'avatar name lastname');

      if (!chat) {
        chat = new Chat({
          user_send,
          user_get,
        });
        await chat.save();
        
        // Полноценно заполняем данные после сохранения
        chat = await Chat.findById(chat._id)
          .populate('user_send', 'avatar name lastname')
          .populate('user_get', 'avatar name lastname');

        const io = getIO();
        io.to(user_send).emit("newChat", chat);
        io.to(user_get).emit("newChat", chat);
      }

      res.status(200).json(chat);
    } catch (error) {
      console.error("Error in createOrGetChat:", error);
      res.status(500).json({ error: "Ошибка при создании чата" });
    }
  }

  async sendMessage(req, res) {
    try {
      const {
        chatId,
        senderId,
        recipientId,
        content,
        attachments = [],
      } = req.body;

      // Проверка существования чата
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Чат не найден" });
      }

      const message = new Message({
        chatId,
        senderId,
        recipientId,
        content,
        attachments,
      });
      await message.save();

      // Обновляем последнее сообщение в чате
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

      const io = getIO();
      io.to(chatId).emit("newMessage", message);
      io.to(senderId).emit("chatUpdated", updatedChat);
      io.to(recipientId).emit("chatUpdated", updatedChat);

      res.status(201).json(message);
    } catch (error) {
      console.error("Error in sendMessage:", error);
      res.status(500).json({ error: "Ошибка при отправке сообщения" });
    }
  }

  async getUserChats(req, res) {
    try {
      const userId = req.user.id;

      const chats = await Chat.find({
        $or: [{ user_send: userId }, { user_get: userId }],
      })
        .sort({ updatedAt: -1 })
        .populate("user_send", "avatar name lastname")
        .populate("user_get", "avatar name lastname")
        .populate("lastMessage.senderId", "avatar name lastname");

      // Добавляем информацию о непрочитанных сообщениях
      const chatsWithUnread = await Promise.all(
        chats.map(async (chat) => {
          const unreadCount = await Message.countDocuments({
            chatId: chat._id,
            recipientId: userId,
            isRead: false,
          });
          return {
            ...chat.toObject(),
            unreadCount,
          };
        })
      );

      res.status(200).json(chatsWithUnread);
    } catch (error) {
      console.error("Error in getUserChats:", error);
      res.status(500).json({ error: "Ошибка при получении чатов" });
    }
  }

  async getChatToId(req, res) {
    try {
      const chatId = req.params.chatId;
      const userId = req.user.id;

      if (chatId.length !== 24) {
        return res.status(404).json({ message: "Чата с таким ID не существует!" });
      }

      const chatInfo = await Chat.findOne({
        _id: chatId,
        $or: [{ user_send: userId }, { user_get: userId }],
      })
        .populate('user_send', 'avatar name lastname')
        .populate('user_get', 'avatar name lastname');

      if (!chatInfo) {
        return res.status(404).json({ message: "Чата с таким ID не существует или у вас нет доступа!" });
      }

      const chatMessages = await Message.find({ chatId }).sort({ createdAt: 1 });

      // Помечаем сообщения как прочитанные
      await Message.updateMany(
        {
          chatId,
          recipientId: userId,
          isRead: false,
        },
        { $set: { isRead: true } }
      );

      res.status(200).json({ chatInfo, chatMessages, chatId });
    } catch (e) {
      console.error("Error in getChatToId:", e);
      res.status(500).json({ message: "Ошибка вывода одного чата" });
    }
  }

  async readMessage(req, res) {
    try {
      const { chatId, messageIds } = req.body;
      const userId = req.user.id;

      await Message.updateMany(
        { 
          _id: { $in: messageIds }, 
          chatId,
          recipientId: userId,
          isRead: false
        },
        { $set: { isRead: true } }
      );

      // Обновляем информацию о чате
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

      const io = getIO();
      io.to(chatId).emit("messagesRead", { chatId, messageIds });

      res.status(200).send({ success: true });
    } catch (error) {
      console.error("Error in readMessage:", error);
      res.status(500).send({ error: "Ошибка при прочтении сообщения" });
    }
  }

  async getChatBetweenUsers(req, res){
    try {
      const { user1Id, user2Id } = req.params;
      
      
      const chat = await Chat.findOne({
        $or: [
          { user_send: user1Id, user_get: user2Id },
          { user_send: user2Id, user_get: user1Id }
        ]
      }).populate('user_send user_get');
  
        if (!chat) {
          let chat2 = new Chat({
            user_send: user1Id,
            user_get: user2Id,
          });
          await chat2.save();
          
          // Полноценно заполняем данные после сохранения
          chat2 = await Chat.findById(chat2._id)
            .populate('user_send', 'avatar name lastname')
            .populate('user_get', 'avatar name lastname');
  
          const io = getIO();
          io.to(user1Id).emit("newChat", chat2);
          io.to(user2Id).emit("newChat", chat2);
          
          return res.json(chat2)
        }
  
      res.json(chat);
    } catch (error) {
      console.error('Ошибка при поиске чата:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  };
}

module.exports = new chatController();