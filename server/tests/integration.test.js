const request = require('supertest');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Подключаем приложение Express для тестирования
// Важно: мы не используем явный вызов server.listen(), чтобы избежать конфликтов портов
let app;
try {
  // Отключаем автоматический вызов метода listen в файле index.js
  process.env.TEST_MODE = 'true';
  app = require('../index.js');
} catch (error) {
  console.error('Ошибка при импорте приложения:', error);
}

// Глобальные переменные для тестирования
let adminToken;
let patientToken;
let doctorToken;
let testPatientId;
let testDoctorId;
let testServiceId;
let testAppointmentId;

// Перед запуском всех тестов
beforeAll(async () => {
  console.log('🚀 Подготовка к запуску интеграционных тестов...');
});

// После выполнения всех тестов
afterAll(async () => {
  console.log('🏁 Все интеграционные тесты завершены');
});

// Описание тестов
describe('💉 Интеграционные тесты API стоматологической клиники', () => {
  
  // 1. Тест авторизации администратора
  test('1. Авторизация администратора', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@dental.com',
        password: 'admin123'
      });
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.role).toBe('admin');
    
    adminToken = response.body.token;
    console.log('✅ Администратор успешно авторизован');
  });
  
  // 2. Тест регистрации пациента
  test('2. Регистрация нового пациента', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: `patient${Date.now()}@test.com`,
        password: 'password123',
        full_name: 'Тестовый Пациент',
        phone: '+7 (999) 123-45-67',
        role: 'patient'
      });
    
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.role).toBe('patient');
    
    patientToken = response.body.token;
    testPatientId = response.body.user.id;
    console.log('✅ Пациент успешно зарегистрирован');
  });
  
  // 3. Тест создания врача администратором
  test('3. Создание нового врача администратором', async () => {
    const response = await request(app)
      .post('/api/admin/doctors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: `doctor${Date.now()}@test.com`,
        password: 'doctor123',
        full_name: 'Тестовый Врач',
        specialization: 'Терапевт',
        experience: 5,
        description: 'Опытный специалист'
      });
    
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    
    testDoctorId = response.body.id;
    console.log('✅ Врач успешно создан администратором');
  });
  
  // 4. Тест авторизации врача
  test('4. Авторизация созданного врача', async () => {
    // Сначала получаем email врача
    const doctorResponse = await request(app)
      .get(`/api/admin/doctors/${testDoctorId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(doctorResponse.statusCode).toBe(200);
    
    const doctorEmail = doctorResponse.body.email;
    
    // Теперь авторизуемся как этот врач
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: doctorEmail,
        password: 'doctor123'
      });
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.role).toBe('doctor');
    
    doctorToken = response.body.token;
    console.log('✅ Врач успешно авторизован');
  });
  
  // 5. Тест получения списка услуг
  test('5. Получение списка услуг', async () => {
    const response = await request(app)
      .get('/api/services');
    
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    
    testServiceId = response.body[0].id;
    console.log('✅ Список услуг успешно получен');
  });
  
  // 6. Тест получения списка врачей
  test('6. Получение списка врачей', async () => {
    const response = await request(app)
      .get('/api/doctors');
    
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    console.log('✅ Список врачей успешно получен');
  });
  
  // 7. Тест создания записи на прием
  test('7. Создание записи на прием', async () => {
    // Установим дату на завтра
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const appointmentDate = tomorrow.toISOString().split('T')[0];
    
    const response = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctor_id: testDoctorId,
        service_id: testServiceId,
        appointment_date: appointmentDate,
        appointment_time: '14:00',
        notes: 'Тестовая запись на прием'
      });
    
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    
    testAppointmentId = response.body.id;
    console.log('✅ Запись на прием успешно создана');
  });
  
  // 8. Тест получения записей пациента
  test('8. Получение записей пациента', async () => {
    const response = await request(app)
      .get('/api/patient/appointments')
      .set('Authorization', `Bearer ${patientToken}`);
    
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    console.log('✅ Список записей пациента успешно получен');
  });
  
  // 9. Тест получения записей врача
  test('9. Получение записей врача', async () => {
    const response = await request(app)
      .get('/api/doctor/appointments')
      .set('Authorization', `Bearer ${doctorToken}`);
    
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    console.log('✅ Список записей врача успешно получен');
  });
  
  // 10. Тест обновления статуса записи врачом
  test('10. Обновление статуса записи врачом', async () => {
    const response = await request(app)
      .put(`/api/doctor/appointments/${testAppointmentId}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        status: 'confirmed'
      });
    
    expect(response.statusCode).toBe(200);
    console.log('✅ Статус записи успешно обновлен врачом');
  });
  
  // 11. Тест создания новой услуги администратором
  test('11. Создание новой услуги администратором', async () => {
    const response = await request(app)
      .post('/api/admin/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Тестовая услуга',
        description: 'Описание тестовой услуги',
        price: 2000,
        duration: 45
      });
    
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    console.log('✅ Новая услуга успешно создана администратором');
  });
  
  // 12. Тест получения всех записей администратором
  test('12. Получение всех записей администратором', async () => {
    const response = await request(app)
      .get('/api/admin/appointments')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    console.log('✅ Список всех записей успешно получен администратором');
  });
  
  // 13. Тест обновления данных врача администратором
  test('13. Обновление данных врача администратором', async () => {
    const response = await request(app)
      .put(`/api/admin/doctors/${testDoctorId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        specialization: 'Ортодонт',
        experience: 7,
        description: 'Обновленное описание врача'
      });
    
    expect(response.statusCode).toBe(200);
    console.log('✅ Данные врача успешно обновлены администратором');
  });
  
  // 14. Тест проверки данных профиля пациента
  test('14. Получение данных профиля пациента', async () => {
    const response = await request(app)
      .get('/api/patient/profile')
      .set('Authorization', `Bearer ${patientToken}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('email');
    expect(response.body).toHaveProperty('full_name');
    expect(response.body.role).toBe('patient');
    console.log('✅ Данные профиля пациента успешно получены');
  });
  
  // 15. Тест обновления статуса записи администратором
  test('15. Обновление статуса записи администратором', async () => {
    const response = await request(app)
      .put(`/api/admin/appointments/${testAppointmentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'completed'
      });
    
    expect(response.statusCode).toBe(200);
    console.log('✅ Статус записи успешно обновлен администратором');
  });
  
  // 16. Тест получения конкретной услуги
  test('16. Получение информации о конкретной услуге', async () => {
    const response = await request(app)
      .get(`/api/services/${testServiceId}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('id', testServiceId);
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('price');
    console.log('✅ Информация о конкретной услуге успешно получена');
  });
  
  // 17. Тест получения конкретного врача
  test('17. Получение информации о конкретном враче', async () => {
    const response = await request(app)
      .get(`/api/doctors/${testDoctorId}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('id', testDoctorId);
    expect(response.body).toHaveProperty('full_name');
    expect(response.body).toHaveProperty('specialization');
    console.log('✅ Информация о конкретном враче успешно получена');
  });
  
  // 18. Тест попытки доступа к административным функциям обычным пользователем
  test('18. Проверка ограничения доступа к административным функциям', async () => {
    const response = await request(app)
      .get('/api/admin/doctors')
      .set('Authorization', `Bearer ${patientToken}`);
    
    expect(response.statusCode).toBe(403);
    console.log('✅ Доступ к административным функциям успешно запрещен обычному пользователю');
  });
  
  // 19. Тест отмены записи пациентом
  test('19. Отмена записи пациентом', async () => {
    // Сначала создадим новую запись
    // Установим дату на послезавтра
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    const appointmentDate = dayAfterTomorrow.toISOString().split('T')[0];
    
    const createResponse = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctor_id: testDoctorId,
        service_id: testServiceId,
        appointment_date: appointmentDate,
        appointment_time: '16:00',
        notes: 'Запись для отмены'
      });
    
    expect(createResponse.statusCode).toBe(201);
    
    // Теперь отменяем эту запись
    const cancelResponse = await request(app)
      .put(`/api/patient/appointments/${createResponse.body.id}`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        status: 'canceled'
      });
    
    expect(cancelResponse.statusCode).toBe(200);
    console.log('✅ Запись успешно отменена пациентом');
  });
  
  // 20. Тест поиска доступного времени для записи
  test('20. Поиск доступного времени для записи', async () => {
    // Установим дату на две недели вперед
    const twoWeeksLater = new Date();
    twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
    const searchDate = twoWeeksLater.toISOString().split('T')[0];
    
    const response = await request(app)
      .get(`/api/appointments/available?doctor_id=${testDoctorId}&date=${searchDate}`);
    
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    console.log('✅ Список доступного времени для записи успешно получен');
  });
}); 