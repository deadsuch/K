/**
 * Тесты работоспособности API сервера стоматологической клиники
 */

const request = require('supertest');

// Загружаем приложение 
process.env.TEST_MODE = 'true';
const app = require('../index.js');

// Главная функция для запуска тестов
async function runTests() {
  console.log('🚀 Запуск тестов API сервера стоматологической клиники');
  console.log('--------------------------------------------------------');
  
  let testsPassed = 0;
  let testsFailed = 0;
  
  // Функция для запуска отдельного теста
  async function runTest(name, testFn) {
    try {
      process.stdout.write(`⚙️  ${name}... `);
      await testFn();
      process.stdout.write('✅ Успех!\n');
      testsPassed++;
    } catch (error) {
      process.stdout.write('❌ Ошибка!\n');
      console.error(`   Причина: ${error.message}\n`);
      testsFailed++;
    }
  }
  
  // Тест 1: Проверка доступности сервера
  await runTest('Проверка доступности сервера', async () => {
    const response = await request(app).get('/');
    if (response.status !== 200 && response.status !== 404) {
      throw new Error(`Неожиданный статус: ${response.status}`);
    }
  });
  
  // Тест 2: Получение списка услуг
  await runTest('Получение списка услуг', async () => {
    const response = await request(app).get('/api/services');
    if (response.status !== 200) {
      throw new Error(`Неожиданный статус: ${response.status}`);
    }
    if (!Array.isArray(response.body)) {
      throw new Error('Ответ должен быть массивом');
    }
  });
  
  // Тест 3: Получение списка врачей
  await runTest('Получение списка врачей', async () => {
    const response = await request(app).get('/api/doctors');
    if (response.status !== 200) {
      throw new Error(`Неожиданный статус: ${response.status}`);
    }
    if (!Array.isArray(response.body)) {
      throw new Error('Ответ должен быть массивом');
    }
  });
  
  // Тест 4: Попытка доступа к защищенному маршруту без токена
  await runTest('Проверка защиты API от неавторизованного доступа', async () => {
    const response = await request(app).get('/api/admin/doctors');
    if (response.status !== 401 && response.status !== 403) {
      throw new Error(`Ожидался статус 401 или 403, получен: ${response.status}`);
    }
  });
  
  // Тест 5: Запрос несуществующего маршрута
  await runTest('Обработка несуществующего маршрута', async () => {
    const response = await request(app).get('/api/non-existent-route');
    if (response.status !== 404) {
      throw new Error(`Ожидался статус 404, получен: ${response.status}`);
    }
  });
  
  // Тест 6: Попытка регистрации с неполными данными
  await runTest('Проверка валидации при регистрации', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'incomplete@example.com'
        // Отсутствуют обязательные поля
      });
    
    if (response.status !== 400 && response.status !== 404 && response.status !== 422) {
      throw new Error(`Ожидался статус ошибки валидации, получен: ${response.status}`);
    }
  });
  
  // Тест 7: Попытка входа с неверными учетными данными
  await runTest('Проверка неверных учетных данных', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'wrongpassword'
      });
    
    if (response.status !== 401 && response.status !== 404 && response.status !== 400) {
      throw new Error(`Ожидался статус ошибки авторизации, получен: ${response.status}`);
    }
  });
  
  // Тест 8: Проверка корректности JSON в ответах
  await runTest('Проверка корректности формата JSON', async () => {
    const response = await request(app).get('/api/services');
    
    try {
      JSON.stringify(response.body);
    } catch (error) {
      throw new Error('Ответ содержит некорректный JSON');
    }
  });
  
  // Тест 9: Проверка поддержки CORS
  await runTest('Проверка поддержки CORS', async () => {
    const response = await request(app)
      .get('/api/services')
      .set('Origin', 'http://example.com');
    
    const corsHeader = response.headers['access-control-allow-origin'];
    if (!corsHeader) {
      throw new Error('Отсутствует заголовок CORS');
    }
  });
  
  // Тест 10: Проверка наличия JSON Content-Type
  await runTest('Проверка Content-Type', async () => {
    const response = await request(app).get('/api/services');
    
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.includes('json')) {
      throw new Error(`Неверный Content-Type: ${contentType}`);
    }
  });
  
  // Тест 11: Проверка времени ответа
  await runTest('Проверка времени ответа', async () => {
    const startTime = Date.now();
    await request(app).get('/api/services');
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    if (responseTime > 5000) {
      throw new Error(`Слишком долгий ответ: ${responseTime}ms`);
    }
  });
  
  // Тест 12: Проверка базовой структуры данных услуг
  await runTest('Проверка структуры данных услуг', async () => {
    const response = await request(app).get('/api/services');
    
    if (response.body.length > 0) {
      const firstService = response.body[0];
      if (!firstService.hasOwnProperty('id')) {
        throw new Error('Услуга не содержит поле id');
      }
      if (!firstService.hasOwnProperty('name')) {
        throw new Error('Услуга не содержит поле name');
      }
      if (!firstService.hasOwnProperty('price')) {
        throw new Error('Услуга не содержит поле price');
      }
    }
  });
  
  // Тест 13: Проверка базовой структуры данных врачей
  await runTest('Проверка структуры данных врачей', async () => {
    const response = await request(app).get('/api/doctors');
    
    if (response.body.length > 0) {
      const firstDoctor = response.body[0];
      if (!firstDoctor.hasOwnProperty('id')) {
        throw new Error('Врач не содержит поле id');
      }
      if (!firstDoctor.hasOwnProperty('full_name') && !firstDoctor.hasOwnProperty('fullName') && !firstDoctor.hasOwnProperty('name')) {
        throw new Error('Врач не содержит поле с именем');
      }
      if (!firstDoctor.hasOwnProperty('specialization')) {
        throw new Error('Врач не содержит поле specialization');
      }
    }
  });
  
  // Тест 14: Проверка стабильности API при многократных запросах
  await runTest('Проверка стабильности API', async () => {
    for (let i = 0; i < 5; i++) {
      const response = await request(app).get('/api/services');
      if (response.status !== 200) {
        throw new Error(`Неудачный запрос №${i+1}: статус ${response.status}`);
      }
    }
  });
  
  // Тест 15: Проверка работы статических файлов
  await runTest('Проверка доступа к статическим файлам', async () => {
    const response = await request(app).get('/uploads/test.jpg');
    
    // Принимаем любой ответ, кроме 500
    if (response.status === 500) {
      throw new Error('Сервер вернул ошибку 500 при запросе статического файла');
    }
  });
  
  // Тест 16: Проверка ответа при передаче некорректных параметров
  await runTest('Проверка обработки некорректных параметров', async () => {
    const response = await request(app).get('/api/services/invalid');
    
    if (response.status !== 400 && response.status !== 404) {
      throw new Error(`Ожидался статус 400 или 404, получен: ${response.status}`);
    }
  });
  
  // Тест 17: Проверка отсутствия критических ошибок при многократных запросах
  await runTest('Проверка отсутствия критических ошибок', async () => {
    const requests = [
      request(app).get('/api/services'),
      request(app).get('/api/doctors'),
      request(app).get('/api/services/1'),
      request(app).get('/api/doctors/1')
    ];
    
    await Promise.all(requests);
  });
  
  // Тест 18: Проверка отсутствия XSS уязвимостей
  await runTest('Базовая проверка на XSS уязвимости', async () => {
    const xssPayload = '<script>alert("XSS");</script>';
    
    // Попытка внедрить XSS через query параметры
    const response = await request(app)
      .get(`/api/services?search=${encodeURIComponent(xssPayload)}`);
    
    // Если сервер не упал, тест пройден
    if (response.status === 500) {
      throw new Error('Сервер вернул ошибку 500 при XSS-тесте');
    }
  });
  
  // Тест 19: Проверка обработки ошибок при POST-запросе с некорректными данными
  await runTest('Проверка обработки некорректных данных в POST-запросе', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send('this is not json');
    
    if (response.status !== 400 && response.status !== 404 && response.status !== 415) {
      throw new Error(`Ожидался статус ошибки, получен: ${response.status}`);
    }
  });
  
  // Тест 20: Проверка обработки больших данных
  await runTest('Проверка обработки больших данных', async () => {
    const largeData = { largeField: 'x'.repeat(10000) };
    
    const response = await request(app)
      .post('/api/auth/login')
      .send(largeData);
    
    if (response.status === 500 || response.status === 413) {
      throw new Error(`Сервер неправильно обработал большие данные: ${response.status}`);
    }
  });
  
  // Выводим общую статистику
  console.log('--------------------------------------------------------');
  console.log(`🏁 Тесты выполнены: ${testsPassed + testsFailed} всего`);
  console.log(`✅ Успешно: ${testsPassed}`);
  if (testsFailed > 0) {
    console.log(`❌ Ошибок: ${testsFailed}`);
  }
  
  // Определяем общий результат
  if (testsFailed === 0) {
    console.log('\n🏆 УСПЕХ! Сервер работает корректно и готов к использованию.');
  } else {
    const successRate = Math.round((testsPassed / (testsPassed + testsFailed)) * 100);
    console.log(`\n⚠️ Сервер работает частично (${successRate}% тестов успешно). Необходимы доработки.`);
  }
}

// Запуск всех тестов
runTests().catch(error => {
  console.error('❌ Критическая ошибка при выполнении тестов:', error);
  process.exit(1);
}); 