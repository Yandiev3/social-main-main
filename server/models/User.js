const { Schema, model } = require("mongoose");

const User = new Schema({
  username: { type: String, unique: true},
  avatar: {type: String, default: "http://localhost:5000/uploads/default/nophoto.png"},
  city: {type: String},
  name: { type: String},
  age: { type: Number },
  email: { type: String},
  password: { type: String },
  registrationDate: { type: Date, default: Date.now },
  roles: [{type: String, ref: "Role"}],
  stack: [{type: String}],
  name: { type: String, default: "Default Name" },
  about: { type: String, default: "Недавно в этой теме"},
  subscribe: { type: String, default: "Нет подписок"},
  subscribers: { type: String, default: "0"},
});

module.exports = model("User", User);