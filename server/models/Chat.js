const { Schema, model } = require('mongoose')

const Chat = new Schema({
  user_send: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  user_get: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isArchived: { type: Boolean, default: false },
  lastMessage: {
    content: String,
    senderId: { type: Schema.Types.ObjectId, ref: 'User' },
    isRead: { type: Boolean, default: false },
    sentAt: Date
  }
});

module.exports = model('Chats', Chat);
