/**
 * Конфигурация клиентской части приложения
 * 
 * Автоматически определяет URL API в зависимости от окружения:
 * - При запуске в Docker: http://localhost/api (через nginx proxy)
 * - При локальной разработке: http://localhost:5000/api
 */

// Конфигурационный файл для клиентской части приложения

// Определяем базовый URL API
let API_URL;
if (process.env.NODE_ENV === 'production') {
  // В продакшене (в Docker) API доступен через nginx proxy на том же домене
  API_URL = `${window.location.origin}/api`;
} else {
  // В режиме разработки используем прямой адрес API
  API_URL = 'http://localhost:5000/api';
}

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