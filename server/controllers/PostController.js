const Post = require("../models/Post");
const User = require("../models/User")
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

    await User.findByIdAndUpdate(id, { 
      $push: { posts: post._id } 
    });

    res.status(201).json({ message: "Post создан", post });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

 const getAllPosts = async (req, res) => {
    try {
        const { id } = req.user;

        const posts = await Post.find({ userId: id }).populate('userId', 'name avatar').sort({ createdAt: -1 });
        // console.log(id);
       
      res.status(200).json({ posts });
    } catch (error) {
      res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
  };

 const getLike = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Пост не найден" });
        }
        res.status(200).json({ likesCount: post.likes?.length || 0 });
    } catch (error) {
      res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
 }

const likePost = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Пост не найден" });
    }

    const likeIndex = post.likes.findIndex(id => id === userId);
    
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
    console.error('Ошибка при лайке:', error);
    throw error;
  }
}


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


const updatePost = async (req, res) => {
  try {
    const { id: userId, roles = [] } = req.user;
    const { postId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Введите текст поста" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Пост не найден" });
    }

    const isAdmin = roles.includes('Admin');
    if (post.userId.toString() !== userId && !isAdmin) {
      return res.status(403).json({ message: "Нет прав для редактирования" });
    }

    post.content = content;
    await post.save();

    res.status(200).json({ message: "Пост обновлен", post });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id: userId, roles = [] } = req.user;
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Пост не найден" });
    }

    const isAdmin = roles.includes('Admin');
    if (post.userId.toString() !== userId && !isAdmin) {
      return res.status(403).json({ message: "Нет прав для удаления" });
    }

    await User.findByIdAndUpdate(post.userId, {
      $pull: { posts: post._id }
    });

    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Пост удален" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};



  module.exports = {createPost, getAllPosts, likePost, addComment, getComments, getLike, updatePost, deletePost,};



  //   const likePost = async (req, res) => {
//   try {
//     const { id: userId } = req.user;
//     const { postId } = req.params;

//     const post = await Post.findById(postId);
//     if (!post) {
//       return res.status(404).json({ message: "Пост не найден" });
//     }

//     const likeIndex = post.likes.indexOf(userId);
//     if (likeIndex === -1) {
//       post.likes.push(userId);
//     } else {
//       post.likes.splice(likeIndex, 1);
//     }

//     await post.save();
//     res.status(200).json({ 
//       isLiked: likeIndex === -1,
//       likesCount: post.likes.length 
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Ошибка сервера", error: error.message });
//   }
// };
