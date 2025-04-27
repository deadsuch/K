import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import './ProfileEdit.css';

const ProfileEdit = ({ onCancel, onProfileUpdate }) => {
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: currentUser?.full_name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('info'); // 'info' или 'password'
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.fullName.trim() === '') {
      setError('ФИО не может быть пустым');
      return;
    }
    
    if (formData.email.trim() === '') {
      setError('Email не может быть пустым');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/profile`, {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSuccess('Данные профиля успешно обновлены');
      
      // Обновляем данные пользователя через колбэк родителя
      if (onProfileUpdate) {
        onProfileUpdate({
          ...currentUser,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone
        });
      }
      
      // Скрываем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка при обновлении профиля');
      console.error('Ошибка:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.currentPassword) {
      setError('Введите текущий пароль');
      return;
    }
    
    if (!formData.newPassword) {
      setError('Введите новый пароль');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/profile`, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSuccess('Пароль успешно изменен');
      
      // Очищаем поля паролей
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Скрываем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка при изменении пароля');
      console.error('Ошибка:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="profile-edit-container">
      <div className="profile-edit-header">
        <h3>Редактирование профиля</h3>
        <button className="btn-close" onClick={onCancel}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      {error && (
        <div className="profile-edit-error">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="profile-edit-success">
          <i className="fas fa-check-circle"></i>
          <span>{success}</span>
        </div>
      )}
      
      <div className="profile-edit-tabs">
        <button 
          className={`profile-tab ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          <i className="fas fa-user"></i> Личные данные
        </button>
        <button 
          className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          <i className="fas fa-lock"></i> Изменить пароль
        </button>
      </div>
      
      {activeTab === 'info' && (
        <form onSubmit={handleInfoSubmit} className="profile-edit-form">
          <div className="form-group">
            <label>ФИО:</label>
            <div className="input-with-icon">
              <i className="fas fa-user"></i>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Введите ваше ФИО"
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Email:</label>
            <div className="input-with-icon">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Введите ваш email"
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Телефон:</label>
            <div className="input-with-icon">
              <i className="fas fa-phone"></i>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Введите ваш телефон"
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel"
              onClick={onCancel}
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className="btn-save"
              disabled={loading}
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      )}
      
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="profile-edit-form">
          <div className="form-group">
            <label>Текущий пароль:</label>
            <div className="input-with-icon">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Введите текущий пароль"
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Новый пароль:</label>
            <div className="input-with-icon">
              <i className="fas fa-key"></i>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Введите новый пароль"
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Подтвердите пароль:</label>
            <div className="input-with-icon">
              <i className="fas fa-check"></i>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Подтвердите новый пароль"
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel"
              onClick={onCancel}
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className="btn-save"
              disabled={loading}
            >
              {loading ? 'Сохранение...' : 'Изменить пароль'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfileEdit; 