import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Проверка паролей
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Пароли не совпадают');
      return;
    }
    
    setLoading(true);
    setErrorMessage('');

    try {
      const { email, password, fullName, phone } = formData;
      await register({ email, password, fullName, phone });
      navigate('/dashboard');
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubRegister = () => {
    window.location.href = 'http://localhost:5000/api/auth/github';
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-card-header">
            <div className="auth-logo">
              <i className="fas fa-tooth"></i>
            </div>
            <h2>Регистрация</h2>
            <p>Создайте свой аккаунт для записи на прием</p>
          </div>
          
          {errorMessage && (
            <div className="auth-error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{errorMessage}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <div className="input-wrapper">
                <i className="fas fa-user input-icon"></i>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="ФИО"
                  className="form-input"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-wrapper">
                <i className="fas fa-envelope input-icon"></i>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-wrapper">
                <i className="fas fa-phone input-icon"></i>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Телефон"
                />
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-wrapper">
                <i className="fas fa-lock input-icon"></i>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Пароль"
                  required
                  minLength="6"
                />
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-wrapper">
                <i className="fas fa-key input-icon"></i>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-input"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Подтверждение пароля"
                  required
                  minLength="6"
                />
              </div>
            </div>
            
            <div className="form-terms">
              <label className="remember-me">
                <input type="checkbox" required /> 
                Я согласен с <Link to="/terms" className="auth-link">условиями использования</Link>
              </label>
            </div>
            
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Регистрация...
                </>
              ) : (
                'Зарегистрироваться'
              )}
            </button>

            <div className="auth-divider">
              <span>или</span>
            </div>

            <button 
              type="button" 
              className="github-auth-btn"
              onClick={handleGitHubRegister}
            >
              <i className="fab fa-github"></i> Зарегистрироваться через GitHub
            </button>
          </form>
          
          <div className="auth-footer">
            <p>Уже есть аккаунт? <Link to="/login" className="auth-link">Войти</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 