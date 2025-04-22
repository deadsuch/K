import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero секция */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Стоматология с заботой о вашей улыбке</h1>
            <p>Современное лечение, профессиональные врачи и комфортная атмосфера для вашего здоровья</p>
            <div className="hero-buttons">
              <Link to="/book-appointment" className="btn btn-primary btn-lg">
                Записаться на прием
              </Link>
              <a href="#services" className="btn btn-outline btn-lg">
                Наши услуги
              </a>
            </div>
          </div>
        </div>
        <div className="hero-wave"></div>
      </section>

      {/* Секция преимуществ */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Почему нас выбирают</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-user-md"></i>
              </div>
              <h3>Опытные специалисты</h3>
              <p>Врачи с многолетним стажем и регулярным повышением квалификации</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-tools"></i>
              </div>
              <h3>Современные технологии</h3>
              <p>Новейшее оборудование и качественные материалы для лечения</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-smile"></i>
              </div>
              <h3>Комфортное лечение</h3>
              <p>Безболезненные процедуры и индивидуальный подход к каждому пациенту</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-clock"></i>
              </div>
              <h3>Удобное расписание</h3>
              <p>Гибкий график работы и возможность экстренного приема</p>
            </div>
          </div>
        </div>
      </section>

      {/* Секция услуг */}
      <section id="services" className="services">
        <div className="container">
          <h2 className="section-title">Наши услуги</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-teeth"></i>
              </div>
              <h3>Лечение зубов</h3>
              <p>Современное лечение кариеса, пульпита и других заболеваний</p>
              <Link to="/services#treatment" className="service-link">Подробнее</Link>
            </div>
            
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-tooth"></i>
              </div>
              <h3>Профилактика</h3>
              <p>Профессиональная чистка, фторирование и защита эмали</p>
              <Link to="/services#prevention" className="service-link">Подробнее</Link>
            </div>
            
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-magic"></i>
              </div>
              <h3>Эстетическая стоматология</h3>
              <p>Отбеливание, виниры и другие услуги для красивой улыбки</p>
              <Link to="/services#aesthetic" className="service-link">Подробнее</Link>
            </div>
            
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-crown"></i>
              </div>
              <h3>Протезирование</h3>
              <p>Установка коронок, мостов и съемных протезов</p>
              <Link to="/services#prosthetics" className="service-link">Подробнее</Link>
            </div>
          </div>
          
          <div className="services-more">
            <Link to="/services" className="btn btn-primary">
              Все услуги и цены
            </Link>
          </div>
        </div>
      </section>

      {/* Секция врачей */}
      <section className="doctors-preview">
        <div className="container">
          <h2 className="section-title">Наши специалисты</h2>
          <p className="section-description">
            Наша клиника объединяет профессионалов с многолетним опытом работы в стоматологии
          </p>
          <div className="doctors-cta">
            <Link to="/doctors" className="btn btn-primary">
              Познакомиться с врачами
            </Link>
          </div>
        </div>
      </section>

      {/* Секция записи на прием */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Запишитесь на консультацию</h2>
            <p>Мы перезвоним вам для подтверждения записи в удобное время</p>
            <Link to="/book-appointment" className="btn btn-light btn-lg">
              Записаться онлайн
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 