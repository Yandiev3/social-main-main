const Router = require("express");
const router = new Router();
const postController = require("../controllers/postController");
const authMiddleware = require("../middlewares/authMiddleware");
//const upload = require("../middlewares/upload");


router.post("/create", authMiddleware, postController.createPost);
//router.get("/posts", getAllPosts);
router.get("/user",  authMiddleware, postController.getAllPosts);
// router.put("/posts/:id", checkAuth, upload, updatePost);
// router.delete("/posts/:id", checkAuth, deletePost);

router.post("/:postId/like", authMiddleware, postController.likePost);
router.get("/:postId/like", authMiddleware, postController.getLike);

router.post("/:postId/comments", authMiddleware, postController.addComment);
router.get("/:postId/comments", authMiddleware, postController.getComments);


module.exports = router;