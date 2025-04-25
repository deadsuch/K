/**
 * Маршрут для проверки работоспособности сервера
 */
const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Проверка работоспособности сервера
 * @access  Публичный
 */
router.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Сервер работает нормально' });
});

module.exports = router; 