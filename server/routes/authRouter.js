const Router = require("express");
const router = new Router();
const controller = require("../controllers/authController");
const { check } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");


router.post("/registration", upload.single("avatar"), [
  check("username", "Имя пользователя не может быть пустым").trim().notEmpty(),
  check("password", "Пароль должен быть больше 6 символов и меньше 10 символов")
    .isLength({ min: 6, max: 10 })
    .trim()
    .notEmpty(),
  controller.registration,
]);
 router.post("/login", controller.login);
 router.get("/users",  controller.getUsers);
 router.get("/profile", authMiddleware, controller.getMe);

module.exports = router;
