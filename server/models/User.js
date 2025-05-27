const { Schema, model } = require("mongoose");

const User = new Schema({
  username: { type: String, unique: true},
  avatar: {type: String, default: "http://localhost:5000/uploads/default/nophoto.png"},
  city: {type: String, default: ""},
  name: { type: String},
  lastname: { type: String, default: "Lastname"},
  age: { type: Number, default: 0 },
  email: { type: String, unique: true, default: "" },
  password: { type: String },
  registrationDate: { type: Date, default: Date.now },
  roles: [{type: String, ref: "Role"}],
  stack: [{type: String}],
  name: { type: String, default: "Name" },
  about: { type: String, default: "Недавно в этой теме"},
  subscribe: { type: String, default: "Нет подписок"},
  subscribers: { type: String, default: "0"},
});

module.exports = model("User", User);