const { Schema, model } = require('mongoose')

const Message = new Schema({
  chatId: { type: Schema.Types.ObjectId, ref: 'Chats', required: true }, // Изменено на ObjectId
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  attachments: [String],
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = model('Messages', Message);