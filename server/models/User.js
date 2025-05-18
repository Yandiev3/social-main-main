const { Schema, model } = require("mongoose");

const User = new Schema({
  username: { type: String, unique: true, required: true },
  avatar: {type: String},
  city: {type: String},
  name: { type: String},
  age: { type: Number },
  email: { type: String},
  password: { type: String, required: true },
  registrationDate: { type: Date, default: Date.now },
  roles: [{type: String, ref: "Role"}],
  stack: [{type: String, ref: "Stack"}],
});

module.exports = model("User", User);