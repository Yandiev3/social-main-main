const {Schema, model} = require("mongoose");

const postSchema = new Schema({
  userId: { type: String, ref: "User", required: true},
  content: { type: String, required: true },
  // image: { type: String },    
  like: [{ type: String }],
  comment: [{ type: String}],
  createdAt: { type: Date, default: Date.now},
    updatedAt: { type: Date, default: Date.now },
});


module.exports = model("Post", postSchema);