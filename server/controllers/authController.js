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

      return res.status(200).json({ token: token });
    } catch (e) {}
  }

  async Profile(req, res){
    try{
      const user = await User.findOne({_id: req.user.id});
      console.log(user);
    }catch(e){
      
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

}
module.exports = new AuthController();
