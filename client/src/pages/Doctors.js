import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Doctors.css';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const serverUrl = 'http://localhost:5000';
  
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/doctors');
        setDoctors(response.data);
        setLoading(false);
      } catch (error) {
        setError('Ошибка при загрузке данных о врачах');
        setLoading(false);
        console.error('Ошибка:', error);
      }
    };
    
    fetchDoctors();
  }, []);
  
  if (loading) {
    return (
      <div className="container loading-container">
        <div className="loading-spinner">Загрузка специалистов...</div>
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
  
  return (
    <div className="doctors-page">
      <div className="doctors-hero">
        <div className="container">
          <h1><i className="fas fa-user-md me-3"></i>Наши специалисты</h1>
          <p>Познакомьтесь с командой профессионалов, которые используют передовые методики и современное оборудование для заботы о здоровье ваших зубов</p>
        </div>
      </div>
      
      <div className="container">
        <div className="doctors-container">
          {doctors.map(doctor => (
            <div key={doctor.id} className="doctor-card">
              <div className="doctor-image">
                {doctor.photo_url ? (
                  <img src={`${serverUrl}${doctor.photo_url}`} alt={doctor.full_name} />
                ) : (
                  <img 
                    src={`/images/doctors/doctor-${doctor.id % 5 + 1}.jpg`} 
                    alt={doctor.full_name} 
                    onError={(e) => {
                      e.target.src = '/images/doctor-placeholder.jpg';
                    }} 
                  />
                )}
              </div>
              <div className="doctor-info">
                <h3>{doctor.full_name}</h3>
                <p className="doctor-specialization">{doctor.specialization}</p>
                {doctor.experience && (
                  <p className="doctor-experience">Опыт работы: {doctor.experience} лет</p>
                )}
                {doctor.description && (
                  <p className="doctor-description">{doctor.description || 'Опытный специалист, владеющий современными методиками лечения. Регулярно повышает квалификацию на тематических конференциях и семинарах.'}</p>
                )}
                <Link to="/book-appointment" className="btn btn-primary">Записаться на прием</Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="doctors-cta">
          <h2><i className="fas fa-user-plus me-2"></i>Хотите присоединиться к нашей команде?</h2>
          <p>Мы всегда рады новым талантливым специалистам. Отправьте нам свое резюме на почту <strong>hr@dentaclinic.ru</strong> или заполните анкету на сайте.</p>
          <a href="mailto:hr@dentaclinic.ru" className="btn btn-primary">
            <i className="fas fa-paper-plane me-2"></i>Отправить резюме
          </a>
        </div>
      </div>
    </div>
  );
};

export default Doctors; 