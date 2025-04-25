/**
 * Конфигурация клиентской части приложения
 * 
 * Автоматически определяет URL API в зависимости от окружения:
 * - При запуске в Docker: http://localhost/api (через nginx proxy)
 * - При локальной разработке: http://localhost:5000
 */

// Конфигурационный файл для клиентской части приложения

// Базовый URL API
const API_URL = window.location.origin;

// Базовый URL для загруженных файлов
const UPLOADS_URL = `${API_URL}/uploads`;

export { API_URL, UPLOADS_URL };

// Экспортируем конфигурацию
export const config = {
  apiUrl: API_URL,
  uploadsUrl: UPLOADS_URL
};

console.log('Конфигурация клиента:', {
  apiUrl: API_URL,
  uploadsUrl: UPLOADS_URL,
  environment: process.env.NODE_ENV,
  hostname: window.location.hostname,
  port: window.location.port
});

export default config; 