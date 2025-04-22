import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Services.css';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/services');
        setServices(response.data);
        setLoading(false);
      } catch (error) {
        setError('Ошибка при загрузке услуг');
        setLoading(false);
        console.error('Ошибка:', error);
      }
    };
    
    fetchServices();
  }, []);
  
  if (loading) {
    return (
      <div className="container loading-container">
        <div className="loading-spinner">Загрузка услуг...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-circle me-2"></i> {error}
        </div>
      </div>
    );
  }
  
  // Функция для получения иконки в зависимости от имени услуги
  const getServiceIcon = (serviceName) => {
    const name = serviceName.toLowerCase();
    
    if (name.includes('чистка') || name.includes('гигиен') || name.includes('профилактик'))
      return <i className="fas fa-shield-alt service-icon"></i>;
    
    if (name.includes('лечение') || name.includes('пломб') || name.includes('кариес'))
      return <i className="fas fa-tools service-icon"></i>;
    
    if (name.includes('протез'))
      return <i className="fas fa-crown service-icon"></i>;
    
    if (name.includes('имплант'))
      return <i className="fas fa-teeth service-icon"></i>;
    
    if (name.includes('отбел') || name.includes('винир') || name.includes('эстет'))
      return <i className="fas fa-magic service-icon"></i>;
    
    if (name.includes('дети') || name.includes('детск'))
      return <i className="fas fa-baby service-icon"></i>;
    
    if (name.includes('удал') || name.includes('хирург'))
      return <i className="fas fa-tooth service-icon"></i>;
    
    if (name.includes('рентген') || name.includes('диагност'))
      return <i className="fas fa-x-ray service-icon"></i>;
    
    // Иконка по умолчанию
    return <i className="fas fa-star service-icon"></i>;
  };
  
  return (
    <div className="services-page">
      <div className="services-hero">
        <div className="container">
          <h1><i className="fas fa-list-alt me-3"></i>Наши услуги</h1>
          <p>Предлагаем полный спектр стоматологических услуг для всей семьи с использованием современных технологий и материалов</p>
        </div>
      </div>
      
      <div className="container">
        <div className="services-container">
          {services.map(service => (
            <div key={service.id} className="service-card">
              <div className="service-card-content">
                <h3>{getServiceIcon(service.name)} {service.name}</h3>
                <p className="service-description">{service.description || 'Высококачественная услуга с применением современных методик и материалов. Безопасно и комфортно.'}</p>
                <div className="service-info">
                  <span className="service-price">{service.price}</span>
                  <span className="service-duration">{service.duration} мин</span>
                </div>
              </div>
              <Link to="/book-appointment" className="btn-book">
                <i className="far fa-calendar-plus me-2"></i>Записаться
              </Link>
            </div>
          ))}
        </div>
        
        <div className="services-cta">
          <h2><i className="fas fa-question-circle me-2"></i>Не нашли то, что искали?</h2>
          <p>Свяжитесь с нами для получения подробной консультации по интересующим вас услугам или запишитесь на бесплатный осмотр</p>
          <Link to="/book-appointment" className="btn btn-primary">
            <i className="fas fa-headset me-2"></i>Получить консультацию
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Services; 