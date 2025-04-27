const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fileUpload = require('express-fileupload');
const fs = require('fs');

// Инициализация Express приложения
const app = express();
const PORT = process.env.PORT || 5000;

// Настройка CORS для разрешения запросов с любого источника
app.use(cors({
  origin: '*', // Разрешает запросы с любого источника
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // кэширование preflight запросов на 24 часа
}));

// Middleware
app.use(express.json());
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 5 * 1024 * 1024 } // Ограничение размера файла - 5MB
}));

// Создаем папку для загрузки файлов, если её нет
const uploadDir = path.join(__dirname, 'uploads/doctors');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Сделаем папку uploads доступной статически
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Секретный ключ для JWT
const JWT_SECRET = 'dental-clinic-secret-key';

// Инициализация базы данных
const dbPath = path.resolve(__dirname, 'dental_clinic.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Ошибка при подключении к базе данных:', err.message);
  } else {
    console.log('Успешное подключение к базе данных SQLite');
    initializeDatabase();
  }
});

// Создание таблиц в базе данных
function initializeDatabase() {
  db.serialize(() => {
    // Таблица пользователей (пациенты и врачи)
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        phone TEXT,
        role TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Таблица услуг стоматологии
    db.run(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        duration INTEGER NOT NULL
      )
    `);

    // Таблица докторов
    db.run(`
      CREATE TABLE IF NOT EXISTS doctors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        specialization TEXT NOT NULL,
        experience INTEGER,
        description TEXT,
        photo_url TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Проверяем существование колонки photo_url и добавляем ее, если она отсутствует
    db.get("PRAGMA table_info(doctors)", (err, rows) => {
      if (err) {
        console.error('Ошибка при проверке структуры таблицы doctors:', err.message);
        return;
      }
      
      // Проверяем, есть ли колонка photo_url
      let hasPhotoUrl = false;
      
      // В SQLite PRAGMA table_info возвращает массив объектов для каждой колонки
      if (Array.isArray(rows)) {
        hasPhotoUrl = rows.some(col => col.name === 'photo_url');
      } else {
        // Если rows не массив, проверим прямым запросом
        db.all("PRAGMA table_info(doctors)", (err, columns) => {
          if (err) {
            console.error('Ошибка при проверке колонок таблицы:', err.message);
            return;
          }
          
          hasPhotoUrl = columns.some(col => col.name === 'photo_url');
          
          // Если колонки нет, добавляем ее
          if (!hasPhotoUrl) {
            db.run("ALTER TABLE doctors ADD COLUMN photo_url TEXT", (err) => {
              if (err) {
                console.error('Ошибка при добавлении колонки photo_url:', err.message);
              } else {
                console.log('Колонка photo_url успешно добавлена в таблицу doctors');
              }
            });
          }
        });
      }
    });

    // Таблица записей на прием
    db.run(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        doctor_id INTEGER NOT NULL,
        service_id INTEGER NOT NULL,
        appointment_date TEXT NOT NULL,
        appointment_time TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES users(id),
        FOREIGN KEY (doctor_id) REFERENCES doctors(id),
        FOREIGN KEY (service_id) REFERENCES services(id)
      )
    `);

    // Добавление тестовых данных (админ/врач)
    db.get("SELECT * FROM users WHERE email = 'admin@dental.com'", (err, row) => {
      if (err) {
        console.error(err.message);
      }
      if (!row) {
        bcrypt.hash('admin123', 10, (err, hash) => {
          if (err) {
            console.error(err.message);
          } else {
            db.run(
              `INSERT INTO users (email, password, full_name, role) 
               VALUES (?, ?, ?, ?)`,
              ['admin@dental.com', hash, 'Администратор', 'admin'],
              function(err) {
                if (err) {
                  console.error(err.message);
                } else {
                  console.log('Администратор создан');
                  db.run(
                    `INSERT INTO doctors (user_id, specialization, experience) 
                     VALUES (?, ?, ?)`,
                    [this.lastID, 'Главный врач', 10],
                    (err) => {
                      if (err) {
                        console.error(err.message);
                      } else {
                        console.log('Данные врача добавлены');
                      }
                    }
                  );
                }
              }
            );
          }
        });
      }
    });

    // Добавляем тестовые услуги
    db.get("SELECT COUNT(*) as count FROM services", (err, row) => {
      if (err) {
        console.error(err.message);
      }
      if (row && row.count === 0) {
        const services = [
          { name: 'Консультация', description: 'Осмотр и консультация стоматолога', price: 1000, duration: 30 },
          { name: 'Чистка зубов', description: 'Профессиональная гигиена полости рта', price: 3500, duration: 60 },
          { name: 'Лечение кариеса', description: 'Лечение кариеса с установкой пломбы', price: 4500, duration: 60 },
          { name: 'Отбеливание зубов', description: 'Профессиональное отбеливание зубов', price: 7000, duration: 90 }
        ];

        const stmt = db.prepare(
          `INSERT INTO services (name, description, price, duration) VALUES (?, ?, ?, ?)`
        );
        
        services.forEach(service => {
          stmt.run(service.name, service.description, service.price, service.duration);
        });
        
        stmt.finalize();
        console.log('Услуги добавлены');
      }
    });
  });
}

// ===== API маршруты =====

// Регистрация пользователя
app.post('/api/register', (req, res) => {
  const { email, password, fullName, phone } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Заполните все обязательные поля' });
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка хеширования пароля' });
    }

    db.run(
      `INSERT INTO users (email, password, full_name, phone, role) VALUES (?, ?, ?, ?, ?)`,
      [email, hash, fullName, phone, 'patient'],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Пользователь с такой почтой уже существует' });
          }
          return res.status(500).json({ error: 'Ошибка при регистрации пользователя' });
        }

        const token = jwt.sign(
          { userId: this.lastID, email, role: 'patient' },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.status(201).json({
          message: 'Пользователь успешно зарегистрирован',
          token,
          userId: this.lastID,
          role: 'patient'
        });
      }
    );
  });
});

// Авторизация пользователя
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }

  db.get(
    `SELECT * FROM users WHERE email = ?`,
    [email],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка сервера' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Неверный email или пароль' });
      }

      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Ошибка сервера' });
        }

        if (!result) {
          return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        const token = jwt.sign(
          {
            userId: user.id,
            email: user.email,
            role: user.role
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.json({
          message: 'Авторизация успешна',
          token,
          userId: user.id,
          role: user.role
        });
      });
    }
  );
});

// Middleware для проверки авторизации
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
}

// Middleware для проверки роли администратора
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Нет доступа. Требуются права администратора.' });
  }
  next();
}

// Middleware для проверки роли врача
function isDoctor(req, res, next) {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ error: 'Нет доступа. Требуются права врача.' });
  }
  next();
}

// Получение профиля пользователя
app.get('/api/profile', authenticateToken, (req, res) => {
  db.get(
    `SELECT id, email, full_name, phone, role FROM users WHERE id = ?`,
    [req.user.userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка сервера' });
      }

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      res.json(user);
    }
  );
});

// Обновление профиля пользователя
app.put('/api/profile', authenticateToken, (req, res) => {
  const { fullName, email, currentPassword, newPassword, phone } = req.body;
  const userId = req.user.userId;
  
  // Проверяем, существует ли пользователь
  db.get(
    `SELECT * FROM users WHERE id = ?`,
    [userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка сервера' });
      }

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }
      
      // Если пользователь хочет изменить пароль, проверяем текущий пароль
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ error: 'Необходимо указать текущий пароль' });
        }
        
        bcrypt.compare(currentPassword, user.password, (err, result) => {
          if (err) {
            return res.status(500).json({ error: 'Ошибка сервера' });
          }
          
          if (!result) {
            return res.status(401).json({ error: 'Текущий пароль неверен' });
          }
          
          // Если текущий пароль верен, хешируем новый пароль
          bcrypt.hash(newPassword, 10, (err, hash) => {
            if (err) {
              return res.status(500).json({ error: 'Ошибка хеширования пароля' });
            }
            
            updateUserProfile(userId, fullName, email, hash, phone, user.email, res);
          });
        });
      } else {
        // Если пароль не меняется, обновляем только другие поля
        updateUserProfile(userId, fullName, email, user.password, phone, user.email, res);
      }
    }
  );
});

// Вспомогательная функция для обновления профиля
function updateUserProfile(userId, fullName, email, password, phone, currentEmail, res) {
  // Проверяем, не занят ли новый email, если он изменился
  if (email && email !== currentEmail) {
    db.get(
      `SELECT id FROM users WHERE email = ? AND id != ?`,
      [email, userId],
      (err, existingUser) => {
        if (err) {
          return res.status(500).json({ error: 'Ошибка сервера' });
        }
        
        if (existingUser) {
          return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }
        
        // Если email не занят, выполняем обновление
        performUserUpdate(userId, fullName, email, password, phone, res);
      }
    );
  } else {
    // Если email не изменился или не указан, сразу выполняем обновление
    performUserUpdate(userId, fullName, email, password, phone, res);
  }
}

// Функция для выполнения обновления
function performUserUpdate(userId, fullName, email, password, phone, res) {
  const updates = {};
  const params = [];
  
  if (fullName) {
    updates.full_name = fullName;
    params.push(fullName);
  }
  
  if (email) {
    updates.email = email;
    params.push(email);
  }
  
  if (password) {
    updates.password = password;
    params.push(password);
  }
  
  if (phone !== undefined) {
    updates.phone = phone;
    params.push(phone);
  }
  
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'Не указаны данные для обновления' });
  }
  
  const setClause = Object.keys(updates)
    .map(field => `${field} = ?`)
    .join(', ');
  
  params.push(userId);
  
  db.run(
    `UPDATE users SET ${setClause} WHERE id = ?`,
    params,
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Ошибка при обновлении профиля' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }
      
      res.json({ 
        message: 'Профиль успешно обновлен',
        updated: Object.keys(updates)
      });
    }
  );
}

// Получение списка услуг
app.get('/api/services', (req, res) => {
  db.all(`SELECT * FROM services`, (err, services) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при получении услуг' });
    }
    res.json(services);
  });
});

// Получение списка врачей
app.get('/api/doctors', (req, res) => {
  db.all(
    `SELECT d.id, u.full_name, d.specialization, d.experience, d.description, d.photo_url
     FROM doctors d 
     JOIN users u ON d.user_id = u.id`,
    (err, doctors) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка при получении списка врачей' });
      }
      res.json(doctors);
    }
  );
});

// Создание записи на прием
app.post('/api/appointments', authenticateToken, (req, res) => {
  const { doctorId, serviceId, appointmentDate, appointmentTime } = req.body;
  const patientId = req.user.userId;

  if (!doctorId || !serviceId || !appointmentDate || !appointmentTime) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }

  // Проверка доступности времени
  db.get(
    `SELECT * FROM appointments 
     WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ?`,
    [doctorId, appointmentDate, appointmentTime],
    (err, appointment) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка сервера' });
      }

      if (appointment) {
        return res.status(400).json({ error: 'Это время уже занято' });
      }

      db.run(
        `INSERT INTO appointments (patient_id, doctor_id, service_id, appointment_date, appointment_time) 
         VALUES (?, ?, ?, ?, ?)`,
        [patientId, doctorId, serviceId, appointmentDate, appointmentTime],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'Ошибка при создании записи' });
          }

          res.status(201).json({
            id: this.lastID,
            message: 'Запись создана успешно'
          });
        }
      );
    }
  );
});

// Получение записей пациента
app.get('/api/patient/appointments', authenticateToken, (req, res) => {
  db.all(
    `SELECT a.*, s.name as service_name, s.price, u.full_name as doctor_name
     FROM appointments a
     JOIN services s ON a.service_id = s.id
     JOIN doctors d ON a.doctor_id = d.id
     JOIN users u ON d.user_id = u.id
     WHERE a.patient_id = ?
     ORDER BY a.appointment_date, a.appointment_time`,
    [req.user.userId],
    (err, appointments) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка при получении записей' });
      }
      res.json(appointments);
    }
  );
});

// Отмена записи пациентом
app.put('/api/patient/appointments/:id', authenticateToken, (req, res) => {
  db.run(
    `UPDATE appointments SET status = 'canceled' 
     WHERE id = ? AND patient_id = ?`,
    [req.params.id, req.user.userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Ошибка при отмене записи' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Запись не найдена или не принадлежит этому пациенту' });
      }

      res.json({ message: 'Запись успешно отменена' });
    }
  );
});

// [АДМИН] Получение всех записей
app.get('/api/admin/appointments', authenticateToken, isAdmin, (req, res) => {
  db.all(
    `SELECT a.*, s.name as service_name, u1.full_name as patient_name, u2.full_name as doctor_name
     FROM appointments a
     JOIN services s ON a.service_id = s.id
     JOIN users u1 ON a.patient_id = u1.id
     JOIN doctors d ON a.doctor_id = d.id
     JOIN users u2 ON d.user_id = u2.id
     ORDER BY a.appointment_date, a.appointment_time`,
    (err, appointments) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка при получении записей' });
      }
      res.json(appointments);
    }
  );
});

// [АДМИН] Изменение статуса записи
app.put('/api/admin/appointments/:id', authenticateToken, isAdmin, (req, res) => {
  const { status } = req.body;

  if (!status || !['pending', 'confirmed', 'completed', 'canceled'].includes(status)) {
    return res.status(400).json({ error: 'Неверный статус' });
  }

  db.run(
    `UPDATE appointments SET status = ? WHERE id = ?`,
    [status, req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Ошибка при обновлении статуса' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Запись не найдена' });
      }

      res.json({ message: 'Статус успешно обновлен' });
    }
  );
});

// [АДМИН] Управление услугами
app.post('/api/admin/services', authenticateToken, isAdmin, (req, res) => {
  const { name, description, price, duration } = req.body;

  if (!name || !price || !duration) {
    return res.status(400).json({ error: 'Заполните все обязательные поля' });
  }

  db.run(
    `INSERT INTO services (name, description, price, duration) VALUES (?, ?, ?, ?)`,
    [name, description, price, duration],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Ошибка при добавлении услуги' });
      }

      res.status(201).json({
        id: this.lastID,
        message: 'Услуга успешно добавлена'
      });
    }
  );
});

// [АДМИН] Получение всех услуг (включая возможность редактирования)
app.get('/api/admin/services', authenticateToken, isAdmin, (req, res) => {
  db.all(`SELECT * FROM services`, (err, services) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при получении услуг' });
    }
    res.json(services);
  });
});

// [АДМИН] Обновление услуги
app.put('/api/admin/services/:id', authenticateToken, isAdmin, (req, res) => {
  const { name, description, price, duration } = req.body;
  const serviceId = req.params.id;

  if (!name || !price || !duration) {
    return res.status(400).json({ error: 'Заполните все обязательные поля' });
  }

  db.run(
    `UPDATE services SET name = ?, description = ?, price = ?, duration = ? WHERE id = ?`,
    [name, description, price, duration, serviceId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Ошибка при обновлении услуги' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Услуга не найдена' });
      }

      res.json({ message: 'Услуга успешно обновлена' });
    }
  );
});

// [АДМИН] Удаление услуги
app.delete('/api/admin/services/:id', authenticateToken, isAdmin, (req, res) => {
  const serviceId = req.params.id;

  // Проверяем, используется ли услуга в записях
  db.get(
    `SELECT COUNT(*) as count FROM appointments WHERE service_id = ?`,
    [serviceId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка сервера' });
      }

      if (row && row.count > 0) {
        return res.status(400).json({ 
          error: 'Невозможно удалить услугу, так как она используется в записях на прием' 
        });
      }

      // Если услуга не используется в записях, удаляем ее
      db.run(
        `DELETE FROM services WHERE id = ?`,
        [serviceId],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'Ошибка при удалении услуги' });
          }

          if (this.changes === 0) {
            return res.status(404).json({ error: 'Услуга не найдена' });
          }

          res.json({ message: 'Услуга успешно удалена' });
        }
      );
    }
  );
});

// [АДМИН] Создание врача
app.post('/api/admin/doctors', authenticateToken, isAdmin, (req, res) => {
  const { fullName, email, password, specialization, experience, description } = req.body;

  if (!fullName || !email || !password || !specialization) {
    return res.status(400).json({ error: 'Заполните все обязательные поля' });
  }

  // Проверка, что email не занят
  db.get(
    `SELECT * FROM users WHERE email = ?`,
    [email],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка сервера' });
      }

      if (user) {
        return res.status(400).json({ error: 'Email уже используется' });
      }

      // Хэширование пароля и создание пользователя
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({ error: 'Ошибка хеширования пароля' });
        }

        db.run(
          `INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)`,
          [email, hash, fullName, 'doctor'],
          function (err) {
            if (err) {
              return res.status(500).json({ error: 'Ошибка при создании пользователя' });
            }

            const userId = this.lastID;

            // Создание записи о враче
            db.run(
              `INSERT INTO doctors (user_id, specialization, experience, description) VALUES (?, ?, ?, ?)`,
              [userId, specialization, experience, description],
              function (err) {
                if (err) {
                  return res.status(500).json({ error: 'Ошибка при создании врача' });
                }

                res.status(201).json({
                  message: 'Врач успешно добавлен',
                  doctorId: this.lastID
                });
              }
            );
          }
        );
      });
    }
  );
});

// [АДМИН] Получение всех врачей (с расширенной информацией)
app.get('/api/admin/doctors', authenticateToken, isAdmin, (req, res) => {
  db.all(
    `SELECT d.id, d.user_id, u.full_name, u.email, d.specialization, d.experience, d.description, d.photo_url 
     FROM doctors d
     JOIN users u ON d.user_id = u.id`,
    (err, doctors) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка при получении списка врачей' });
      }
      res.json(doctors);
    }
  );
});

// [АДМИН] Обновление информации о враче
app.put('/api/admin/doctors/:id', authenticateToken, isAdmin, (req, res) => {
  const { fullName, specialization, experience, description } = req.body;
  const doctorId = req.params.id;

  if (!fullName || !specialization) {
    return res.status(400).json({ error: 'Заполните все обязательные поля' });
  }

  // Получаем user_id врача
  db.get(
    `SELECT user_id FROM doctors WHERE id = ?`,
    [doctorId],
    (err, doctor) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка сервера' });
      }

      if (!doctor) {
        return res.status(404).json({ error: 'Врач не найден' });
      }

      // Обновляем информацию о пользователе
      db.run(
        `UPDATE users SET full_name = ? WHERE id = ?`,
        [fullName, doctor.user_id],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Ошибка при обновлении информации о пользователе' });
          }

          // Обновляем информацию о враче
          db.run(
            `UPDATE doctors SET specialization = ?, experience = ?, description = ? WHERE id = ?`,
            [specialization, experience, description, doctorId],
            function (err) {
              if (err) {
                return res.status(500).json({ error: 'Ошибка при обновлении информации о враче' });
              }

              res.json({ message: 'Информация о враче успешно обновлена' });
            }
          );
        }
      );
    }
  );
});

// [АДМИН] Удаление врача
app.delete('/api/admin/doctors/:id', authenticateToken, isAdmin, (req, res) => {
  const doctorId = req.params.id;

  // Проверяем, есть ли записи на этого врача
  db.get(
    `SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ?`,
    [doctorId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка сервера' });
      }

      if (row && row.count > 0) {
        return res.status(400).json({ 
          error: 'Невозможно удалить врача, так как есть записи на прием к нему' 
        });
      }

      // Получаем user_id и photo_url врача
      db.get(
        `SELECT user_id, photo_url FROM doctors WHERE id = ?`,
        [doctorId],
        (err, doctor) => {
          if (err) {
            return res.status(500).json({ error: 'Ошибка сервера' });
          }

          if (!doctor) {
            return res.status(404).json({ error: 'Врач не найден' });
          }

          // Удаляем фото врача, если оно есть
          if (doctor.photo_url) {
            const photoPath = path.join(__dirname, doctor.photo_url.replace(/^\/uploads/, 'uploads'));
            if (fs.existsSync(photoPath)) {
              fs.unlinkSync(photoPath);
            }
          }

          // Удаляем запись о враче
          db.run(
            `DELETE FROM doctors WHERE id = ?`,
            [doctorId],
            function (err) {
              if (err) {
                return res.status(500).json({ error: 'Ошибка при удалении врача' });
              }

              // Удаляем пользователя
              db.run(
                `DELETE FROM users WHERE id = ?`,
                [doctor.user_id],
                function (err) {
                  if (err) {
                    return res.status(500).json({ error: 'Ошибка при удалении пользователя' });
                  }

                  res.json({ message: 'Врач успешно удален' });
                }
              );
            }
          );
        }
      );
    }
  );
});

// [АДМИН] Загрузка фото врача
app.post('/api/admin/doctors/:id/photo', authenticateToken, isAdmin, (req, res) => {
  const doctorId = req.params.id;
  
  // Проверяем, существует ли врач
  db.get(
    `SELECT * FROM doctors WHERE id = ?`,
    [doctorId],
    (err, doctor) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка сервера' });
      }

      if (!doctor) {
        return res.status(404).json({ error: 'Врач не найден' });
      }
      
      // Проверяем, был ли загружен файл
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ error: 'Файл не загружен' });
      }
      
      const photo = req.files.photo;
      const fileExtension = photo.name.split('.').pop().toLowerCase();
      
      // Проверяем формат файла
      if (!['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
        return res.status(400).json({ error: 'Неподдерживаемый формат файла. Используйте JPG, PNG или GIF' });
      }
      
      // Удаляем старую фотографию, если она существует
      if (doctor.photo_url) {
        const oldPhotoPath = path.join(__dirname, doctor.photo_url.replace(/^\/uploads/, 'uploads'));
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      
      // Генерируем уникальное имя файла
      const fileName = `doctor_${doctorId}_${Date.now()}.${fileExtension}`;
      const uploadPath = path.join(uploadDir, fileName);
      
      // Сохраняем файл
      photo.mv(uploadPath, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Ошибка при загрузке файла' });
        }
        
        // Обновляем путь к фото в базе данных
        const photoUrl = `/uploads/doctors/${fileName}`;
        db.run(
          `UPDATE doctors SET photo_url = ? WHERE id = ?`,
          [photoUrl, doctorId],
          function (err) {
            if (err) {
              return res.status(500).json({ error: 'Ошибка при обновлении данных врача' });
            }
            
            res.json({ 
              message: 'Фото врача успешно загружено',
              photoUrl: photoUrl
            });
          }
        );
      });
    }
  );
});

// [ВРАЧ] Получение id врача по id пользователя
async function getDoctorIdByUserId(userId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id FROM doctors WHERE user_id = ?`,
      [userId],
      (err, doctor) => {
        if (err) {
          reject(err);
        } else {
          resolve(doctor ? doctor.id : null);
        }
      }
    );
  });
}

// [ВРАЧ] Получение записей для конкретного врача
app.get('/api/doctor/appointments', authenticateToken, isDoctor, async (req, res) => {
  try {
    // Получаем id врача по id пользователя
    const doctorId = await getDoctorIdByUserId(req.user.userId);
    
    if (!doctorId) {
      return res.status(404).json({ error: 'Информация о враче не найдена' });
    }
    
    // Получаем все записи к этому врачу
    db.all(
      `SELECT a.*, s.name as service_name, u.full_name as patient_name, u.email, u.phone
       FROM appointments a
       JOIN services s ON a.service_id = s.id
       JOIN users u ON a.patient_id = u.id
       WHERE a.doctor_id = ?
       ORDER BY a.appointment_date, a.appointment_time`,
      [doctorId],
      (err, appointments) => {
        if (err) {
          return res.status(500).json({ error: 'Ошибка при получении записей' });
        }
        res.json(appointments);
      }
    );
  } catch (error) {
    console.error('Ошибка при получении записей врача:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// [ВРАЧ] Обновление статуса записи
app.put('/api/doctor/appointments/:id', authenticateToken, isDoctor, async (req, res) => {
  const appointmentId = req.params.id;
  const { status } = req.body;

  if (!status || !['pending', 'confirmed', 'completed', 'canceled'].includes(status)) {
    return res.status(400).json({ error: 'Неверный статус' });
  }

  try {
    // Получаем id врача по id пользователя
    const doctorId = await getDoctorIdByUserId(req.user.userId);
    
    if (!doctorId) {
      return res.status(404).json({ error: 'Информация о враче не найдена' });
    }

    // Проверяем, что запись принадлежит данному врачу
    db.get(
      `SELECT * FROM appointments WHERE id = ? AND doctor_id = ?`,
      [appointmentId, doctorId],
      (err, appointment) => {
        if (err) {
          return res.status(500).json({ error: 'Ошибка при проверке записи' });
        }

        if (!appointment) {
          return res.status(404).json({ error: 'Запись не найдена или не принадлежит этому врачу' });
        }

        // Обновляем статус записи
        db.run(
          `UPDATE appointments SET status = ? WHERE id = ?`,
          [status, appointmentId],
          function (err) {
            if (err) {
              return res.status(500).json({ error: 'Ошибка при обновлении статуса' });
            }

            res.json({ message: 'Статус успешно обновлен' });
          }
        );
      }
    );
  } catch (error) {
    console.error('Ошибка при обновлении статуса записи:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Подключаем маршруты
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/doctors', require('./routes/doctors')); 
// app.use('/api/patients', require('./routes/patients'));
// app.use('/api/services', require('./routes/services'));
// app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/health', require('./routes/health'));

// Запускаем сервер, но только если не в тестовом режиме
if (process.env.TEST_MODE !== 'true') {
  app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
  });
}

// Экспортируем приложение для использования в тестах
module.exports = app; 