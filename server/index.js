const express = require("express");
const cors = require('cors');
const { default: mongoose } = require("mongoose");
const authRouter = require("./routes/authRouter");
const postRouter = require("./routes/postRouter");
const  { createPost, getAllPosts } = "./controllers/postController";
const authMiddleware = require("./middlewares/authMiddleware");
const authController = require("./controllers/authController");

const PORT = process.env.PORT || 5000;
const app = express({ limit: "100mb" });

app.use(cors());
app.use(express.json());
app.use('/auth', authRouter);
app.use('/uploads', express.static('uploads'));
app.use('/post', postRouter);

app.route('/profile/:id', authMiddleware, authController.Profile)


const start = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/');
    app.listen(PORT, () => {
      console.clear();
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
};

start();