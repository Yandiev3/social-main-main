const {Schema, model} = require("mongoose");

const Stack = new Schema({
    value: {type: String, default:"Evrijasiers"},
});

module.exports = model("Stack", Stack);