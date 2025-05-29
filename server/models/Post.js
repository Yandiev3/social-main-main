import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
  content: { type: String, required: true },
  image: { type: String },    
  like: [{ type: String }],
  comment: [{ type: String}],
  createdAt: { type: Date, default: Date.now},
    updatedAt: { type: Date, default: Date.now },
});


export default mongoose.model("Post", postSchema);