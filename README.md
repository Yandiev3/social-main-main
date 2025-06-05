https://www.figma.com/design/oGHQigWHYDVfYA7GPRi9q1/%F0%9F%92%ABTIK-TALK?node-id=4010-7553&t=rlrwkAH6BtLcgQna-0


async Profile(req, res) {
  try {
    const user = await User.findOne({_id: req.params.id})
      .select('-password') // исключаем пароль
      .populate('posts'); // если нужно загрузить посты
    
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    
    res.status(200).json(user);
  } catch(e) {
    console.error(e);
    res.status(500).json({ message: "Ошибка сервера" });
  }
}
