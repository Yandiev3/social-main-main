const {Schema, model} = require("mongoose");

const commentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const postSchema = new Schema({
  userId: { type: String, ref: "User", required: true},
  content: { type: String, required: true },
  // image: { type: String },      
  likes: [{ type: Number, default: 0 }],
  comments: [{ type: commentSchema }],
  createdAt: { type: Date, default: Date.now},
    updatedAt: { type: Date, default: Date.now },
});

postSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});


module.exports = model("Post", postSchema);