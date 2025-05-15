const {Schema, model} = require("mongoose");

const Role = new Schema({
    value: {type: String, default:"User"},
});

module.exports = model("Role", Role);