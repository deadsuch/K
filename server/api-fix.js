/**
 * Скрипт для исправления таблицы doctors и API
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('Исправление таблицы doctors и API...');

// Подключение к базе данных
const dbPath = path.resolve(__dirname, 'dental_clinic.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Ошибка при подключении к базе данных:', err.message);
    process.exit(1);
  }
  console.log('Успешно подключились к базе данных SQLite.');
  
  // Добавление колонки photo_url в таблицу doctors, если её нет
  db.all("PRAGMA table_info(doctors)", (err, columns) => {
    if (err) {
      console.error('Ошибка при получении структуры таблицы:', err);
      db.close();
      return;
    }
    
    // Проверяем наличие колонки photo_url
    const hasPhotoUrl = columns.some(col => col.name === 'photo_url');
    
    if (!hasPhotoUrl) {
      // Добавляем колонку photo_url
      db.run("ALTER TABLE doctors ADD COLUMN photo_url TEXT", (err) => {
        if (err) {
          console.error('Ошибка при добавлении колонки photo_url:', err);
          db.close();
          return;
        }
        
        console.log('Колонка photo_url успешно добавлена в таблицу doctors.');
        testApiQuery();
      });
    } else {
      console.log('Колонка photo_url уже существует в таблице doctors.');
      testApiQuery();
    }
  });
});

// Тестирование запроса API
function testApiQuery() {
  db.all(
    `SELECT d.id, u.full_name, d.specialization, d.experience, d.description, d.photo_url
     FROM doctors d 
     JOIN users u ON d.user_id = u.id`,
    (err, docs) => {
      if (err) {
        console.error('Ошибка при выполнении запроса API для /api/doctors:', err);
      } else {
        console.log('Результат запроса API для /api/doctors (должен работать):');
        console.log(docs);
      }
      
      // Закрываем соединение с базой данных
      db.close(() => {
        console.log('Соединение с базой данных закрыто.');
        console.log('Перезапустите сервер, чтобы изменения вступили в силу.');
      });
    }
  );
} 