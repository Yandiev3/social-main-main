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

class authController {
  async registration(req, res) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ meassage: "Ошибка при регистрации", errors });
      }
      const { name, username, age, email, password  } = req.body;
      const candidate = await User.findOne({ username });

      if (candidate) {
        return res
          .status(400)
          .json({ message: "Пользователь с тиаким именем уже существует" });
      }
      const hashPassword = bcrypt.hashSync(password, 8);
      const userRole = await Role.findOne({ value: "User"});
      const userStack = await Stack.findOne({ value: "Evrijasiers"});
      

      const user = new User({
        name,
        username,
        age,
        email,
        password: hashPassword,
        roles: [userRole.value],
        stack: [userStack.value],
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
      const user = await User.findById(req.user.id); 
  
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
      const {name, username, avatar, city, age, email, stack, about} = req.body;
      const User = await User.findByIdAndUpdate({ "_id": id }, {username : username, avatar : avatar, city: city, name: name, age: age, email: email, stack: stack, about: about});
      res.status(200).json({message: "Продукт изменен"})
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = new authController();
