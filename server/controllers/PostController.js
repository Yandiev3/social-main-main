const Post = require("../models/Post");

 const createPost = async (req, res) => {
  try {
    const { id } = req.user;
    const {
        content, 
        likes, 
        comment, 
        createdAt, 
        updatedAt
    } = req.body;

    if (
      !content
    ) {
      return res.status(400).json({ message: "Ведите что нибудь" });
    }

    //const photoPaths = req.files.map((file) => file.path);

    const post = new Post({
        userId: id,
        content, 
        // image,
        likes, 
        comment, 
        createdAt, 
        updatedAt
    });

    await post.save();
    res.status(201).json({ message: "Post создан", post });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

 const getAllPosts = async (req, res) => {
    try {
        const { id } = req.user;

        const posts = await Post.find({ userId: id }).sort({ createdAt: -1 });
        // console.log(id);
       
      res.status(200).json({ posts });
    } catch (error) {
      res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
  };

  const likePost = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Пост не найден" });
    }

    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.status(200).json({ 
      isLiked: likeIndex === -1,
      likesCount: post.likes.length 
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId).populate({
      path: 'comments.userId',
      select: 'name avatar'
    });
    
    if (!post) {
      return res.status(404).json({ message: "Пост не найден" });
    }
    
    res.status(200).json({ comments: post.comments || [] });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

  const addComment = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { postId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Введите текст комментария" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Пост не найден" });
    }
    if (!post.comments) {
          post.comments = [];
    }
    const newComment = {
      userId,
      text,
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    const populatedPost = await Post.populate(post, {
      path: 'comments.userId',
      select: 'name avatar'
    });

    res.status(201).json({ 
      comment: populatedPost.comments[populatedPost.comments.length - 1],
      commentsCount: populatedPost.comments.length
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};


  module.exports = {createPost, getAllPosts, likePost, addComment, getComments};