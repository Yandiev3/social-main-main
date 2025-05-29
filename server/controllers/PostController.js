import Post from "../models/Post.js";

export const createPost = async (req, res) => {
  try {
    const { id } = req.user;
    
    const {
        content, 
        image,
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
        image,
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

export const getAllPosts = async (req, res) => {
    try {
        const { id } = req.user;

        const posts = await Post.find({ userId: id }).sort({ createdAt: -1 });
        console.log(id);
       
      res.status(200).json({ posts });
    } catch (error) {
      res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
  };