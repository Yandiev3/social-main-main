const { Schema, model } = require("mongoose");
const { array } = require("../middlewares/upload");

const User = new Schema({
  username: { type: String, unique: true},
  avatar: {type: String, default: "http://localhost:5000/uploads/default/nophoto.png"},
  city: {type: String, default: ""},
  lastname: { type: String, default: "Lastname"},
  age: { type: Number, default: 0 },
  email: { type: String, default: ""},
  password: { type: String },
  registrationDate: { type: Date, default: Date.now },
  roles: [{type: String, ref: "Role"}],
  stack: [{type: String}],
  name: { type: String, default: "Name" },
  about: { type: String, default: "Недавно тут"},
  subscribers: [{ type: String, ref: "User" }],
  subscriptions: [{ type: String, ref: "User" }],
  posts: [{type: Schema.Types.ObjectId, ref: "Posts"}],

  isOnline: { type: Boolean },
  lastSeen: { type: Date },
  refreshToken: { type: String },
});

module.exports = model("User", User);