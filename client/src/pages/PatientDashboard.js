import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { currentUser } = useAuth();
  
  // Загрузка записей пациента
  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/patient/appointments', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAppointments(response.data);
      setLoading(false);
    } catch (error) {
      setError('Ошибка при загрузке записей');
      setLoading(false);
      console.error('Ошибка:', error);
    }
  };
  
  useEffect(() => {
    fetchAppointments();
  }, []);
  
  // Отмена записи
  const cancelAppointment = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/patient/appointments/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Обновляем список записей
      fetchAppointments();
      setSuccessMessage('Запись успешно отменена');
      
      // Через 3 секунды скрываем сообщение об успехе
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setError('Ошибка при отмене записи');
      console.error('Ошибка:', error);
    }
  };
  
  // Форматирование даты
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };
  
  return (
    <div className="container">
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Личный кабинет</h1>
          <Link to="/book-appointment" className="btn btn-primary">Записаться на прием</Link>
        </div>
        
        {successMessage && (
          <div className="alert alert-success">
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}
        
        <div className="dashboard-section">
          <div className="card profile-card">
            <h2>Мой профиль</h2>
            <div className="profile-info">
              <p><strong>ФИО:</strong> {currentUser?.full_name}</p>
              <p><strong>Email:</strong> {currentUser?.email}</p>
              <p><strong>Телефон:</strong> {currentUser?.phone || 'Не указан'}</p>
            </div>
          </div>
        </div>
        
        <div className="dashboard-section">
          <h2>Мои записи на прием</h2>
          
          {loading ? (
            <p>Загрузка...</p>
          ) : appointments.length > 0 ? (
            <div className="appointments-list">
              {appointments.map((appointment) => (
                <div key={appointment.id} className={`appointment-card status-${appointment.status}`}>
                  <div className="appointment-header">
                    <h3>{appointment.service_name}</h3>
                    <span className={`status-badge status-${appointment.status}`}>
                      {appointment.status === 'pending' && 'Ожидание'}
                      {appointment.status === 'confirmed' && 'Подтверждено'}
                      {appointment.status === 'completed' && 'Завершено'}
                      {appointment.status === 'canceled' && 'Отменено'}
                    </span>
                  </div>
                  
                  <div className="appointment-details">
                    <p><strong>Врач:</strong> {appointment.doctor_name}</p>
                    <p><strong>Дата:</strong> {formatDate(appointment.appointment_date)}</p>
                    <p><strong>Время:</strong> {appointment.appointment_time}</p>
                    <p><strong>Стоимость:</strong> {appointment.price} руб.</p>
                  </div>
                  
                  {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => cancelAppointment(appointment.id)}
                    >
                      Отменить запись
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-appointments">
              <p>У вас пока нет записей на прием</p>
              <Link to="/book-appointment" className="btn btn-primary">Записаться на прием</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard; 