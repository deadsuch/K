/**
 * Интеграционные тесты для API сервера стоматологической клиники
 * 
 * Этот файл содержит 20 интеграционных тестов для проверки 
 * основной функциональности API сервера.
 * 
 * Запуск тестов: node integration-tests.js
 */

const axios = require('axios');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Базовый URL для тестирования
const BASE_URL = 'http://localhost:5000';

// Переменные для хранения тестовых данных
let adminToken = '';
let doctorToken = '';
let patientToken = '';
let testDoctorId = '';
let testPatientId = '';
let testServiceId = '';
let testAppointmentId = '';

// Цвета для вывода в консоль
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Функция для логирования с цветом
function log(message, color = colors.reset) {
  console.log(color + message + colors.reset);
}

// Функция для форматирования вывода результатов теста
function formatTestResult(testName, passed, error = null) {
  if (passed) {
    log(`✅ ${testName}: Успешно`, colors.green);
  } else {
    log(`❌ ${testName}: Ошибка`, colors.red);
    if (error) log(`   ${error.message || error}`, colors.red);
  }
}

// Обертка для тестовых функций
async function runTest(testName, testFunction) {
  try {
    await testFunction();
    formatTestResult(testName, true);
    return true;
  } catch (error) {
    formatTestResult(testName, false, error);
    return false;
  }
}

// Массив для хранения тестов и их результатов
const tests = [];

// Функция для запуска всех тестов последовательно
async function runAllTests() {
  log('\n' + colors.bright + colors.cyan + '='.repeat(60), colors.cyan);
  log('ИНТЕГРАЦИОННЫЕ ТЕСТЫ СЕРВЕРА СТОМАТОЛОГИЧЕСКОЙ КЛИНИКИ', colors.cyan);
  log('='.repeat(60) + '\n', colors.cyan);

  let passedCount = 0;
  let failedCount = 0;

  for (const test of tests) {
    const result = await runTest(test.name, test.fn);
    if (result) {
      passedCount++;
    } else {
      failedCount++;
    }
  }

  // Вывод итоговой статистики
  log('\n' + '='.repeat(60), colors.cyan);
  log(`ИТОГО: ${passedCount} из ${tests.length} тестов пройдено успешно`, 
      passedCount === tests.length ? colors.green : colors.yellow);
  
  if (passedCount === tests.length) {
    log('\n🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО! Сервер работает корректно! 🎉\n', colors.green + colors.bright);
  } else {
    log(`\n⚠️ ${failedCount} тестов не пройдено. Проверьте работу сервера.\n`, colors.yellow + colors.bright);
  }
}

// ----- ТЕСТЫ -----

// Тест 1: Проверка доступности сервера
tests.push({
  name: 'Проверка доступности сервера',
  fn: async () => {
    const response = await axios.get(`${BASE_URL}/api/health`);
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.status, 'ok');
  }
});

// Тест 2: Аутентификация администратора
tests.push({
  name: 'Аутентификация администратора',
  fn: async () => {
    const response = await axios.post(`${BASE_URL}/api/login`, {
      email: 'admin@dental.com',
      password: 'admin123'
    });
    
    assert.strictEqual(response.status, 200);
    assert.ok(response.data.token);
    adminToken = response.data.token;
  }
});

// Тест 3: Создание тестового врача
tests.push({
  name: 'Создание тестового врача',
  fn: async () => {
    const response = await axios.post(
      `${BASE_URL}/api/admin/doctors`,
      {
        firstName: 'Тестовый',
        lastName: 'Врач',
        specialization: 'Терапевт',
        phone: '+7(900)123-45-67',
        email: 'test.doctor@dental.com',
        password: 'doctor123',
        description: 'Тестовый врач для интеграционных тестов'
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    assert.strictEqual(response.status, 201);
    assert.ok(response.data.id);
    testDoctorId = response.data.id;
  }
});

// Тест 4: Аутентификация тестового врача
tests.push({
  name: 'Аутентификация тестового врача',
  fn: async () => {
    const response = await axios.post(`${BASE_URL}/api/login`, {
      email: 'test.doctor@dental.com',
      password: 'doctor123'
    });
    
    assert.strictEqual(response.status, 200);
    assert.ok(response.data.token);
    doctorToken = response.data.token;
  }
});

// Тест 5: Регистрация тестового пациента
tests.push({
  name: 'Регистрация тестового пациента',
  fn: async () => {
    const response = await axios.post(`${BASE_URL}/api/register`, {
      firstName: 'Тестовый',
      lastName: 'Пациент',
      email: 'test.patient@example.com',
      password: 'patient123',
      phone: '+7(900)765-43-21',
      birthDate: '1990-01-01'
    });
    
    assert.strictEqual(response.status, 201);
    assert.ok(response.data.id);
    testPatientId = response.data.id;
  }
});

// Тест 6: Аутентификация тестового пациента
tests.push({
  name: 'Аутентификация тестового пациента',
  fn: async () => {
    const response = await axios.post(`${BASE_URL}/api/login`, {
      email: 'test.patient@example.com',
      password: 'patient123'
    });
    
    assert.strictEqual(response.status, 200);
    assert.ok(response.data.token);
    patientToken = response.data.token;
  }
});

// Тест 7: Получение списка врачей
tests.push({
  name: 'Получение списка врачей',
  fn: async () => {
    const response = await axios.get(`${BASE_URL}/api/doctors`);
    
    assert.strictEqual(response.status, 200);
    assert.ok(Array.isArray(response.data));
    assert.ok(response.data.length > 0);
    
    // Проверяем, есть ли наш тестовый врач в списке
    const testDoctor = response.data.find(doctor => doctor.id === testDoctorId);
    assert.ok(testDoctor);
  }
});

// Тест 8: Получение информации о конкретном враче
tests.push({
  name: 'Получение информации о конкретном враче',
  fn: async () => {
    const response = await axios.get(`${BASE_URL}/api/doctors/${testDoctorId}`);
    
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.id, testDoctorId);
    assert.strictEqual(response.data.firstName, 'Тестовый');
    assert.strictEqual(response.data.lastName, 'Врач');
  }
});

// Тест 9: Создание услуги
tests.push({
  name: 'Создание услуги',
  fn: async () => {
    const response = await axios.post(
      `${BASE_URL}/api/admin/services`,
      {
        name: 'Тестовая услуга',
        description: 'Описание тестовой услуги',
        price: 1000,
        duration: 30
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    assert.strictEqual(response.status, 201);
    assert.ok(response.data.id);
    testServiceId = response.data.id;
  }
});

// Тест 10: Получение списка услуг
tests.push({
  name: 'Получение списка услуг',
  fn: async () => {
    const response = await axios.get(`${BASE_URL}/api/services`);
    
    assert.strictEqual(response.status, 200);
    assert.ok(Array.isArray(response.data));
    
    // Проверяем, есть ли наша тестовая услуга в списке
    const testService = response.data.find(service => service.id === testServiceId);
    assert.ok(testService);
    assert.strictEqual(testService.name, 'Тестовая услуга');
  }
});

// Тест 11: Создание записи на прием
tests.push({
  name: 'Создание записи на прием',
  fn: async () => {
    // Получаем завтрашнюю дату в формате ISO
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    const response = await axios.post(
      `${BASE_URL}/api/appointments`,
      {
        doctorId: testDoctorId,
        serviceId: testServiceId,
        appointmentDate: tomorrow.toISOString().split('T')[0],
        appointmentTime: '10:00',
        comment: 'Тестовая запись на прием'
      },
      { headers: { Authorization: `Bearer ${patientToken}` } }
    );
    
    assert.strictEqual(response.status, 201);
    assert.ok(response.data.id);
    testAppointmentId = response.data.id;
  }
});

// Тест 12: Получение списка записей на прием для пациента
tests.push({
  name: 'Получение списка записей на прием для пациента',
  fn: async () => {
    const response = await axios.get(
      `${BASE_URL}/api/patient/appointments`,
      { headers: { Authorization: `Bearer ${patientToken}` } }
    );
    
    assert.strictEqual(response.status, 200);
    assert.ok(Array.isArray(response.data));
    
    // Проверяем, есть ли наша тестовая запись в списке
    const testAppointment = response.data.find(appointment => appointment.id === testAppointmentId);
    assert.ok(testAppointment);
  }
});

// Тест 13: Получение списка записей на прием для врача
tests.push({
  name: 'Получение списка записей на прием для врача',
  fn: async () => {
    const response = await axios.get(
      `${BASE_URL}/api/doctor/appointments`,
      { headers: { Authorization: `Bearer ${doctorToken}` } }
    );
    
    assert.strictEqual(response.status, 200);
    assert.ok(Array.isArray(response.data));
    
    // Проверяем, есть ли наша тестовая запись в списке
    const testAppointment = response.data.find(appointment => appointment.id === testAppointmentId);
    assert.ok(testAppointment);
  }
});

// Тест 14: Обновление услуги
tests.push({
  name: 'Обновление услуги',
  fn: async () => {
    const response = await axios.put(
      `${BASE_URL}/api/admin/services/${testServiceId}`,
      {
        name: 'Обновленная тестовая услуга',
        description: 'Обновленное описание тестовой услуги',
        price: 1500,
        duration: 45
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    assert.strictEqual(response.status, 200);
    
    // Проверяем, что услуга действительно обновилась
    const getResponse = await axios.get(`${BASE_URL}/api/services/${testServiceId}`);
    assert.strictEqual(getResponse.data.name, 'Обновленная тестовая услуга');
    assert.strictEqual(getResponse.data.price, 1500);
  }
});

// Тест 15: Обновление профиля врача
tests.push({
  name: 'Обновление профиля врача',
  fn: async () => {
    const response = await axios.put(
      `${BASE_URL}/api/admin/doctors/${testDoctorId}`,
      {
        fullName: 'Тестовый Врач',
        specialization: 'Хирург',
        experience: 5,
        description: 'Обновленное описание тестового врача'
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    assert.strictEqual(response.status, 200);
    
    // Проверяем, что профиль врача действительно обновился
    const getResponse = await axios.get(`${BASE_URL}/api/doctors/${testDoctorId}`);
    assert.strictEqual(getResponse.data.specialization, 'Хирург');
  }
});

// Тест 16: Обновление статуса записи на прием
tests.push({
  name: 'Обновление статуса записи на прием',
  fn: async () => {
    const response = await axios.put(
      `${BASE_URL}/api/doctor/appointments/${testAppointmentId}`,
      {
        status: 'confirmed'
      },
      { headers: { Authorization: `Bearer ${doctorToken}` } }
    );
    
    assert.strictEqual(response.status, 200);
    
    // Проверяем, что статус записи действительно обновился
    const getResponse = await axios.get(
      `${BASE_URL}/api/patient/appointments`,
      { headers: { Authorization: `Bearer ${patientToken}` } }
    );
    
    const testAppointment = getResponse.data.find(appointment => appointment.id === testAppointmentId);
    assert.strictEqual(testAppointment.status, 'confirmed');
  }
});

// Тест 17: Загрузка фото врача
tests.push({
  name: 'Загрузка фото врача',
  fn: async () => {
    // Создаем тестовый файл изображения
    const testImagePath = path.join(__dirname, 'test-doctor-image.jpg');
    if (!fs.existsSync(testImagePath)) {
      // Создаем пустой файл для теста
      fs.writeFileSync(testImagePath, Buffer.from('fake image content'));
    }
    
    const formData = new FormData();
    formData.append('photo', fs.createReadStream(testImagePath));
    
    const response = await axios.post(
      `${BASE_URL}/api/admin/doctors/${testDoctorId}/photo`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${adminToken}`
        }
      }
    );
    
    assert.strictEqual(response.status, 200);
    assert.ok(response.data.photoUrl);
    
    // Удаляем тестовое изображение после теста
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  }
});

// Тест 18: Получение профиля пациента
tests.push({
  name: 'Получение профиля пациента',
  fn: async () => {
    const response = await axios.get(
      `${BASE_URL}/api/profile`,
      { headers: { Authorization: `Bearer ${patientToken}` } }
    );
    
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.full_name, 'Тестовый Пациент');
    assert.strictEqual(response.data.email, 'test.patient@example.com');
  }
});

// Тест 19: Получение списка услуг для админа
tests.push({
  name: 'Получение списка услуг для админа',
  fn: async () => {
    const response = await axios.get(
      `${BASE_URL}/api/admin/services`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    assert.strictEqual(response.status, 200);
    assert.ok(Array.isArray(response.data));
  }
});

// Тест 20: Удаление тестовых данных
tests.push({
  name: 'Удаление тестовых данных',
  fn: async () => {
    // Удаляем тестовую запись на прием
    let response = await axios.delete(
      `${BASE_URL}/api/admin/appointments/${testAppointmentId}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    assert.strictEqual(response.status, 200);
    
    // Удаляем тестовую услугу
    response = await axios.delete(
      `${BASE_URL}/api/admin/services/${testServiceId}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    assert.strictEqual(response.status, 200);
    
    // Удаляем тестового врача
    response = await axios.delete(
      `${BASE_URL}/api/admin/doctors/${testDoctorId}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    assert.strictEqual(response.status, 200);
    
    // Проверяем, что врач удален
    try {
      await axios.get(`${BASE_URL}/api/doctors/${testDoctorId}`);
      assert.fail('Врач не был удален');
    } catch (error) {
      assert.strictEqual(error.response.status, 404);
    }
  }
});

// Запускаем все тесты
runAllTests().catch(error => {
  log('\n⚠️ Ошибка при запуске тестов:', colors.red);
  log(error.message, colors.red);
  
  if (error.response) {
    log('Ответ сервера:', colors.yellow);
    log(JSON.stringify(error.response.data, null, 2), colors.yellow);
  }
}); 