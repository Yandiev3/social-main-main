const User = require("../models/User");
const Role = require("../models/UserRole");
const Stack = require("../models/UserStack");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { secret } = require("../config");

const generateAccessToken = (id) => {
  const payload = {
    id,
  };
  return jwt.sign(payload, secret, { expiresIn: "24h" });
};

class AuthController {
  async registration(req, res) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ meassage: "Ошибка при регистрации", errors });
      }
      const { name, username, age, email, password, lastname } = req.body;
      const candidate = await User.findOne({ username });

      if (candidate) {
        return res
          .status(400)
          .json({ message: "Пользователь с тиаким именем уже существует" });
      }
      const hashPassword = bcrypt.hashSync(password, 8);
      const userRole = await Role.findOne({ value: "User"});
      

      const user = new User({
        name,
        lastname,
        username,
        age,
        email,
        password: hashPassword,
        roles: [userRole.value],
        Stack: [],
      });
      if (req.file) {
        user.avatar = req.file.path;
      }

      await user.save();
      // const message = {
       
      //   to: req.body.email,
      //   subject: "Подтверждение электронной почты",
      //   text: `Поздравляем вы успешно зарегистрировались на нашем сайте
      //   данные вашей учетной записи
      //   login:${req.body.username} , 
      //   password: ${req.body.password}`,
      // };

      
      return res.status(200).json("Регистрация прошла успешно");
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: "Ошибка регистрации" });
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) {
        return res
          .status(400)
          .json({ message: "Неправильный логин или пароль, повторите вход!" });
      }
      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) {
        return res
          .status(400)
          .json({ message: "Введен неверный логин или пароль" });
      }
      const token = generateAccessToken(user._id, user.roles, user.stacks);

      return res.status(200).json({ token: token, id: user._id });
    } catch (e) {}
  }

  async Profile(req, res){
    try {
      const id = req.params.id === "null" ? req.user.id : req.params.id

      const user = await User.findById(id); 
      
      if (!user) {
        return res.status(404).json({ message: "Ошибка при получение данных " });
      }
      const { password, ...userData } = user._doc; 
  
      res.json(userData);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Ошибка при получении данных пользователя" });
    }
  }

  async getUsers(req, res) {
    try {
      const users = await User.find();
      res.json(users);
    } catch (e) {
      console.log(e);
      
    }
  }

  async getMe(req, res) {
    try {
      const id = req.params.id === "null" ? req.user.id : req.params.id

      const user = await User.findById(id); 
      
      if (!user) {
        return res.status(404).json({ message: "Ошибка при получение данных " });
      }
      const { password, ...userData } = user._doc; 
  
      res.json(userData);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Ошибка при получении данных пользователя" });
    }
  }



async updateUser(req, res) {
  try {
    const id = req.params.id;
    const { name, username, city, age, email, stack, about } = req.body;
    
    // Создаем объект для обновления
    const updateData = { 
      username, 
      city, 
      name, 
      age, 
      email, 
      stack, 
      about 
    };

    // Если есть файл, добавляем путь к аватару
    if (req.file) {
      updateData.avatar = `http://localhost:5000/${req.file.path.replace(/\\/g, '/')}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id, // Просто передаем id, а не объект
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    res.status(200).json({ 
      message: "Профиль успешно обновлен", 
      user: updatedUser 
    });
    
  } catch (e) {
    console.error("Ошибка при обновлении:", e);
    res.status(500).json({ message: "Ошибка сервера при обновлении" });
  }
}

  async subscribe(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Пользователь не авторизован" });
      }
      const userId = req.user.id;
      const targetUserId = req.params.id;

      if (userId === targetUserId) {
        return res.status(400).json({ message: "Нельзя подписаться на самого себя" });
      }

      const user = await User.findById(userId);
      const targetUser = await User.findById(targetUserId);

      if (!targetUser) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      if (!user.subscriptions) {
        user.subscriptions = [];
      }
      if (!targetUser.subscribers) {
        targetUser.subscribers = [];
      }

      if (user.subscriptions.includes(targetUserId)) {
        return res.status(400).json({ message: "Вы уже подписаны на этого пользователя" });
      }

      user.subscriptions.push(targetUserId);
      targetUser.subscribers.push(userId);

      await user.save();
      await targetUser.save();

      res.status(200).json({ message: "Подписка успешно оформлена" });
    } catch (error) {
      console.error("Ошибка при подписке:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }

  async unsubscribe(req, res) {
    try {
      const userId = req.user.id;
      const targetUserId = req.params.id;

      const user = await User.findById(userId);
      const targetUser = await User.findById(targetUserId);

      if (!targetUser) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      if (!user.subscriptions || !user.subscriptions.includes(targetUserId)) {
        return res.status(400).json({ message: "Вы не подписаны на этого пользователя" });
      }

      user.subscriptions = user.subscriptions.filter(id => id.toString() !== targetUserId);
      console.log(user.subscriptions);
      
      targetUser.subscribers = targetUser.subscribers.filter(id => id.toString() !== userId);

      await user.save();
      await targetUser.save();

      res.status(200).json({ message: "Отписка успешно выполнена" });
    } catch (error) {
      console.error("Ошибка при отписке:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }


  async checkSubscription(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Пользователь не авторизован" });
      }
      const userId = req.user.id;
      const targetUserId = req.params.id;

       console.log("Проверка подписки:", { userId, targetUserId, token: req.headers.authorization });

      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      const isSubscribed = user.subscriptions && user.subscriptions.includes(targetUserId);
      
      res.status(200).json({ isSubscribed });
    } catch (error) {
      console.error("Ошибка при проверке подписки:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }
}
module.exports = new AuthController();
