import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      const response = await login(formData.email, formData.password);
      
      // В зависимости от роли пользователя, перенаправляем на соответствующую страницу
      if (response.role === 'admin') {
        navigate('/admin');
      } else if (response.role === 'doctor') {
        navigate('/doctor');
      } else {
        navigate('/dashboard');
      }
      
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка при авторизации');
      console.error('Ошибка:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-card-header">
            <div className="auth-logo">
              <i className="fas fa-tooth"></i>
            </div>
            <h2>Вход в систему</h2>
            <p>Добро пожаловать! Пожалуйста, войдите в свой аккаунт</p>
          </div>
          
          {error && (
            <div className="auth-error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <div className="input-wrapper">
                <i className="fas fa-envelope input-icon"></i>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className="form-input"
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
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Пароль"
                  required
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" /> Запомнить меня
              </label>
              <Link to="/forgot-password" className="forgot-password">Забыли пароль?</Link>
            </div>
            
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Вход...
                </>
              ) : (
                'Войти'
              )}
            </button>
          </form>
          
          <div className="auth-footer">
            <p>Еще нет аккаунта? <Link to="/register" className="auth-link">Зарегистрироваться</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 