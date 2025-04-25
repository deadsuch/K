/**
 * Базовые тесты для API сервера стоматологической клиники
 * 
 * Этот файл содержит 5 базовых тестов для проверки 
 * работоспособности сервера.
 * 
 * Запуск тестов: node basic-tests.js
 */

const axios = require('axios');
const assert = require('assert');

// Базовый URL для тестирования
const BASE_URL = process.env.API_URL || 'http://localhost:5000';

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
  log('БАЗОВЫЕ ТЕСТЫ СЕРВЕРА СТОМАТОЛОГИЧЕСКОЙ КЛИНИКИ', colors.cyan);
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

// Тест 2: Получение списка услуг
tests.push({
  name: 'Получение списка услуг',
  fn: async () => {
    const response = await axios.get(`${BASE_URL}/api/services`);
    assert.strictEqual(response.status, 200);
    assert.ok(Array.isArray(response.data));
    assert.ok(response.data.length > 0);
  }
});

// Тест 3: Получение списка врачей
tests.push({
  name: 'Получение списка врачей',
  fn: async () => {
    const response = await axios.get(`${BASE_URL}/api/doctors`);
    assert.strictEqual(response.status, 200);
    assert.ok(Array.isArray(response.data));
  }
});

// Тест 4: Авторизация администратора
tests.push({
  name: 'Авторизация администратора',
  fn: async () => {
    const response = await axios.post(`${BASE_URL}/api/login`, {
      email: 'admin@dental.com',
      password: 'admin123'
    });
    
    assert.strictEqual(response.status, 200);
    assert.ok(response.data.token);
    
    // Сохраняем токен для следующего теста
    global.adminToken = response.data.token;
  }
});

// Тест 5: Проверка доступа администратора к защищенному маршруту
tests.push({
  name: 'Проверка доступа администратора к защищенному маршруту',
  fn: async () => {
    const response = await axios.get(
      `${BASE_URL}/api/admin/services`,
      { headers: { Authorization: `Bearer ${global.adminToken}` } }
    );
    
    assert.strictEqual(response.status, 200);
    assert.ok(Array.isArray(response.data));
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