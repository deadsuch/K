import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './BookAppointment.css';

const BookAppointment = () => {
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [timeSlots] = useState([
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ]);
  
  const [formData, setFormData] = useState({
    serviceId: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Проверка авторизации
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Загрузка услуг и врачей
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesResponse, doctorsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/services'),
          axios.get('http://localhost:5000/api/doctors')
        ]);
        
        setServices(servicesResponse.data);
        setDoctors(doctorsResponse.data);
        setLoading(false);
      } catch (error) {
        setError('Ошибка при загрузке данных');
        setLoading(false);
        console.error('Ошибка:', error);
      }
    };
    
    fetchData();
  }, []);
  
  // Обработка изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/appointments',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setSuccessMessage('Запись успешно создана');
      
      // Через 2 секунды перенаправляем в личный кабинет
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка при создании записи');
      setSubmitting(false);
    }
  };
  
  // Получение выбранной услуги
  const selectedService = services.find(service => service.id === parseInt(formData.serviceId));
  
  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner">
          Загрузка...
        </div>
      </div>
    );
  }
  
  return (
    <div className="container">
      <div className="booking-container">
        <h1>Запись на прием</h1>
        
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
        
        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-section">
            <h3>1. Выберите услугу</h3>
            <div className="services-grid">
              {services.map(service => (
                <div 
                  key={service.id}
                  className={`service-option ${formData.serviceId === service.id.toString() ? 'selected' : ''}`}
                  onClick={() => setFormData({...formData, serviceId: service.id.toString()})}
                >
                  <h4>{service.name}</h4>
                  <p>{service.description}</p>
                  <div className="service-details">
                    <span className="service-price">{service.price} руб.</span>
                    <span className="service-duration">{service.duration} мин</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-section">
            <h3>2. Выберите врача</h3>
            <div className="doctors-grid">
              {doctors.map(doctor => (
                <div 
                  key={doctor.id}
                  className={`doctor-option ${formData.doctorId === doctor.id.toString() ? 'selected' : ''}`}
                  onClick={() => setFormData({...formData, doctorId: doctor.id.toString()})}
                >
                  <h4>{doctor.full_name}</h4>
                  <p><strong>Специализация:</strong> {doctor.specialization}</p>
                  {doctor.experience && (
                    <p><strong>Опыт работы:</strong> {doctor.experience} лет</p>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-section">
            <h3>3. Выберите дату и время</h3>
            
            <div className="date-time-selection">
              <div className="form-group">
                <label htmlFor="appointmentDate">Дата приема</label>
                <input
                  type="date"
                  id="appointmentDate"
                  name="appointmentDate"
                  className="form-control"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              {formData.appointmentDate && (
                <div className="time-slots">
                  <label>Выберите время</label>
                  <div className="time-options">
                    {timeSlots.map(time => (
                      <div
                        key={time}
                        className={`time-option ${formData.appointmentTime === time ? 'selected' : ''}`}
                        onClick={() => setFormData({...formData, appointmentTime: time})}
                      >
                        {time}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="booking-summary">
            <h3>Сводка записи</h3>
            <div className="summary-details">
              <div className="summary-row">
                <span>Услуга:</span>
                <span>{selectedService ? selectedService.name : 'Не выбрана'}</span>
              </div>
              
              <div className="summary-row">
                <span>Врач:</span>
                <span>
                  {formData.doctorId 
                    ? doctors.find(d => d.id === parseInt(formData.doctorId))?.full_name 
                    : 'Не выбран'}
                </span>
              </div>
              
              <div className="summary-row">
                <span>Дата и время:</span>
                <span>
                  {formData.appointmentDate && formData.appointmentTime 
                    ? `${formData.appointmentDate} в ${formData.appointmentTime}` 
                    : 'Не выбраны'}
                </span>
              </div>
              
              <div className="summary-row">
                <span>Стоимость:</span>
                <span>{selectedService ? `${selectedService.price} руб.` : '-'}</span>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={submitting || !formData.serviceId || !formData.doctorId || !formData.appointmentDate || !formData.appointmentTime}
          >
            {submitting ? 'Создание записи...' : 'Записаться на прием'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment; 