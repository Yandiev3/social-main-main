const { Schema, model } = require('mongoose')

const Message = new Schema({
  chatId: { type: String, ref: 'Chat', required: true },
  senderId: { type: String, ref: 'User', required: true },
  recipientId: { type: String, ref: 'User', required: true },
  content: { type: String, required: true },
  attachments: [String],
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = model('Messages', Message);