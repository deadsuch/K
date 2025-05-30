import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Создание контекста
const AuthContext = createContext();

// Хук для использования контекста
export const useAuth = () => {
  return useContext(AuthContext);
};

// Провайдер контекста
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Загрузка данных пользователя при первом рендере
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Получение профиля пользователя
  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setCurrentUser(response.data);
      setUserRole(response.data.role);
      setLoading(false);
      
      // Логирование для отладки
      console.log('Профиль пользователя загружен:', response.data);
      console.log('Роль пользователя:', response.data.role);
    } catch (error) {
      console.error('Ошибка при получении профиля:', error);
      localStorage.removeItem('token');
      setLoading(false);
    }
  };

  // Регистрация пользователя
  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      localStorage.setItem('token', response.data.token);
      setCurrentUser({ id: response.data.userId, ...userData });
      setUserRole(response.data.role);
      setError('');
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка при регистрации');
      throw error;
    }
  };

  // Авторизация пользователя
  const login = async (email, password) => {
    try {
      console.log('Отправка запроса на вход:', `${API_URL}/login`, { email, password: '***' });
      
      const response = await axios.post(`${API_URL}/login`, { email, password });
      console.log('Получен ответ при входе:', response.data);
      
      localStorage.setItem('token', response.data.token);
      await fetchUserProfile(response.data.token);
      setError('');
      return response.data;
    } catch (error) {
      console.error('Login error details:', error);
      console.error('Status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Request config:', error.config);
      
      if (error.response?.status === 401) {
        setError('Неверный email или пароль');
      } else {
        setError(error.response?.data?.error || 'Ошибка при авторизации');
      }
      throw error;
    }
  };

  // Выход из системы
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setUserRole(null);
  };

  // Обновление профиля пользователя
  const updateUserProfile = (updatedUser) => {
    setCurrentUser(updatedUser);
    if (updatedUser.role) {
      setUserRole(updatedUser.role);
    }
  };

  // Возвращаем значение контекста
  const value = {
    currentUser,
    userRole,
    isAuthenticated: !!currentUser,
    loading,
    error,
    register,
    login,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 