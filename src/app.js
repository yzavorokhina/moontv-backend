require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 3000;
const saltRounds = 10;

const users = [
  { username: 'admin', email: 'konfeta@mail.ru', password: '12345' },
  { username: 'user', email: 'zefir@mail.ru', password: 'password' }
];

for (const user of users) {
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(user.password, salt, function(err, hash) {
            user.hash = hash;
        });
    });
}

const corsOptions = {
  origin: ['http://127.0.0.1:3000', 'http://127.0.0.1:5500'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Настройка CORS
app.use(cors(corsOptions)); // Разрешает запросы со всех источников

// Middleware для парсинга JSON
app.use(express.json());

// Middleware для парсинга данных форм
app.use(express.urlencoded({ extended: false }));

// Базовый маршрут
app.get('/', (req, res) => {
  res.send('Привет, Express!');
});

app.post('/api/login', async (req, res) => {
  try {

    console.log({ body: req.body });

    const { email, password } = req.body;
    
    // Проверка учётных данных
    const user = users.find(u => u.email === email);
    console.log({ user, email, password });
    if (!user || !(await bcrypt.compare(password, user.hash))) {
      return res.status(401).json({ message: 'Неверные учётные данные' });
    }
    
    // Генерация JWT
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});