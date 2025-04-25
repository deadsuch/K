#!/usr/bin/env node

/**
 * Скрипт для запуска интеграционных тестов стоматологической клиники
 * 
 * Запуск: node run-tests.js
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Проверяем наличие файла тестов
const testFile = path.join(__dirname, 'tests', 'server-test.js');
if (!fs.existsSync(testFile)) {
  console.error('❌ Ошибка: Файл тестов не найден. Проверьте наличие файла:', testFile);
  process.exit(1);
}

// Красивый заголовок
console.log('\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('                                                                          ');
console.log('                 ИНТЕГРАЦИОННЫЕ ТЕСТЫ СТОМАТОЛОГИЧЕСКОЙ КЛИНИКИ            ');
console.log('                                                                          ');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n');

// Запуск процесса тестирования
const testProcess = spawn('node', ['tests/server-test.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

// Обработка завершения процесса
testProcess.on('close', (code) => {
  if (code === 0) {
    // Тесты прошли успешно
    console.log('\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('                                                                          ');
    console.log('                      ✅  ВСЕ ТЕСТЫ УСПЕШНО ПРОЙДЕНЫ!                     ');
    console.log('                                                                          ');
    console.log('                 Сервер полностью работоспособен и готов к                ');
    console.log('                        промышленной эксплуатации                         ');
    console.log('                                                                          ');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } else {
    // Тесты завершились с ошибкой
    console.log('\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('                                                                          ');
    console.log('                     ❌  ПРИ ВЫПОЛНЕНИИ ТЕСТОВ ВОЗНИКЛИ                   ');
    console.log('                              ОШИБКИ!                                     ');
    console.log('                                                                          ');
    console.log('                  Необходимо исправить ошибки перед запуском             ');
    console.log('                            в эксплуатацию                                ');
    console.log('                                                                          ');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }
}); 