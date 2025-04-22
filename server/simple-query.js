const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('Проверка базы данных...');

// Подключение к базе данных
const dbPath = path.resolve(__dirname, 'dental_clinic.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Ошибка при подключении к базе данных:', err.message);
    process.exit(1);
  }
  console.log('Успешно подключились к базе данных SQLite.');
});

// Получение структуры таблицы doctors
db.all('PRAGMA table_info(doctors)', (err, columns) => {
  if (err) {
    console.error('Ошибка при получении структуры таблицы:', err);
    db.close();
    process.exit(1);
  }
  
  console.log('Структура таблицы doctors:');
  console.log(columns);
  
  // Получение всех записей из таблицы doctors
  db.all('SELECT * FROM doctors', (err, rows) => {
    if (err) {
      console.error('Ошибка при запросе данных из таблицы doctors:', err);
      db.close();
      process.exit(1);
    }
    
    console.log('Записи в таблице doctors:');
    console.log(rows);

    // Проверка маршрута API
    db.all(
      `SELECT d.id, u.full_name, d.specialization, d.experience, d.description, d.photo_url
       FROM doctors d 
       JOIN users u ON d.user_id = u.id`,
      (err, docs) => {
        if (err) {
          console.error('Ошибка при выполнении запроса API для /api/doctors:', err);
        } else {
          console.log('Результат запроса API для /api/doctors:');
          console.log(docs);
        }
        
        // Закрываем соединение с базой данных
        db.close(() => {
          console.log('Соединение с базой данных закрыто.');
        });
      }
    );
  });
}); 