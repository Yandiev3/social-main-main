const Router = require("express");
const router = new Router();
const postController = require("../controllers/PostController");
const authMiddleware = require("../middlewares/authMiddleware");
//const upload = require("../middlewares/upload");


router.post("/create", authMiddleware, postController.createPost);
//router.get("/posts", getAllPosts);
router.get("/user",  authMiddleware, postController.getAllPosts);
// router.put("/posts/:id", checkAuth, upload, updatePost);
// router.delete("/posts/:id", checkAuth, deletePost);

router.post("/:postId/like", authMiddleware, postController.likePost);
router.post("/:postId/comments", authMiddleware, postController.addComment);
router.get("/:postId/comments", authMiddleware, postController.getComments);


module.exports = router;