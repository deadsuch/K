import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './DoctorsList.css';

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('/api/doctors');
        setDoctors(response.data);
        setLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке данных о врачах');
        setLoading(false);
        console.error('Ошибка при загрузке врачей:', err);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <div className="doctors-container">
        <div className="loading-spinner">
          <i className="fas fa-circle-notch fa-spin me-2"></i> Загрузка информации о врачах...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doctors-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle me-2"></i> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="doctors-page">
      <div className="container">
        <div className="page-header">
          <h1><i className="fas fa-user-md me-2"></i>Наши специалисты</h1>
          <p>Познакомьтесь с нашей командой высококвалифицированных стоматологов, готовых позаботиться о здоровье ваших зубов</p>
        </div>

        <div className="doctors-grid">
          {doctors.map((doctor) => (
            <div className="doctor-card" key={doctor._id}>
              <div className="doctor-card-inner">
                <div className="doctor-image">
                  {doctor.photo ? (
                    <img src={doctor.photo} alt={`${doctor.firstName} ${doctor.lastName}`} />
                  ) : (
                    <div className="no-photo">
                      <i className="fas fa-user-md"></i>
                    </div>
                  )}
                </div>
                <div className="doctor-info">
                  <h2>{doctor.firstName} {doctor.lastName}</h2>
                  <p className="doctor-specialization">{doctor.specialization}</p>
                  <div className="doctor-details">
                    <p>
                      <i className="fas fa-graduation-cap me-2"></i>
                      <span>{doctor.education || 'Информация будет добавлена'}</span>
                    </p>
                    <p>
                      <i className="fas fa-briefcase me-2"></i>
                      <span>Стаж работы: {doctor.experience || '0'} лет</span>
                    </p>
                    <div className="doctor-bio">
                      {doctor.bio || 'Информация о враче будет добавлена в ближайшее время.'}
                    </div>
                  </div>
                  <Link to={`/book-appointment?doctorId=${doctor._id}`} className="btn btn-primary">
                    <i className="fas fa-calendar-plus me-1"></i> Записаться на прием
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {doctors.length === 0 && (
          <div className="no-doctors">
            <i className="fas fa-info-circle fa-2x mb-3"></i>
            <h3>В настоящее время список врачей обновляется</h3>
            <p>Пожалуйста, загляните позже или позвоните нам для уточнения информации</p>
          </div>
        )}

        <div className="team-cta">
          <div className="team-cta-content">
            <h2>Не знаете, какой специалист вам нужен?</h2>
            <p>Запишитесь на предварительную консультацию, и мы подберем для вас подходящего врача</p>
            <Link to="/book-appointment" className="btn btn-primary btn-lg">
              <i className="fas fa-headset me-2"></i>Получить консультацию
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorsList; 