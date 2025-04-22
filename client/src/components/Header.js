import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isAuthenticated, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Отслеживание прокрутки страницы
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Закрытие выпадающего меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.user-menu')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const getDashboardLink = () => {
    switch (userRole) {
      case 'admin':
        return '/admin';
      case 'doctor':
        return '/doctor';
      case 'patient':
        return '/dashboard';
      default:
        return '/';
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  // Проверяет активна ли ссылка
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="container">
        <div className="navbar">
          <div className="logo">
            <Link to="/" onClick={closeMenu}>
              <i className="fas fa-tooth logo-icon"></i>
              <span className="logo-text">ДентаКлиник</span>
            </Link>
          </div>

          <button className="nav-toggle" onClick={toggleMenu} aria-label="Переключить меню">
            <i className={menuOpen ? "fas fa-times" : "fas fa-bars"}></i>
          </button>

          <nav className={`nav ${menuOpen ? 'show-menu' : ''}`}>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link 
                  to="/" 
                  onClick={closeMenu}
                  className={isActive('/') ? 'active-link' : ''}
                >
                  Главная
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/services" 
                  onClick={closeMenu}
                  className={isActive('/services') ? 'active-link' : ''}
                >
                  Услуги
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/doctors" 
                  onClick={closeMenu}
                  className={isActive('/doctors') ? 'active-link' : ''}
                >
                  Врачи
                </Link>
              </li>
              
              {/* Кнопки для авторизованных пользователей */}
              {isAuthenticated ? (
                <>
                  {/* Ссылки для пациентов */}
                  {userRole === 'patient' && (
                    <li className="nav-item">
                      <Link 
                        to="/book-appointment" 
                        onClick={closeMenu}
                        className={isActive('/book-appointment') ? 'active-link' : ''}
                      >
                        Записаться
                      </Link>
                    </li>
                  )}
                  
                  {/* Выпадающее меню для пользователя */}
                  <li className="nav-item user-menu">
                    <div 
                      className={`user-profile ${dropdownOpen ? 'active' : ''}`} 
                      onClick={toggleDropdown}
                    >
                      <i className="fas fa-user-circle"></i>
                      <span className="user-role">
                        {userRole === 'admin' ? 'Админ' : 
                         userRole === 'doctor' ? 'Врач' : 'Пациент'}
                      </span>
                      <i className={`fas ${dropdownOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                    </div>
                    <div className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
                      <Link 
                        to={getDashboardLink()} 
                        onClick={() => {closeMenu(); setDropdownOpen(false);}}
                        className="dropdown-item"
                      >
                        {userRole === 'admin' ? 'Панель админа' : 
                         userRole === 'doctor' ? 'Панель врача' : 'Личный кабинет'}
                      </Link>
                      <button 
                        className="dropdown-item" 
                        onClick={handleLogout}
                      >
                        Выход
                      </button>
                    </div>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item auth-buttons">
                    <Link 
                      to="/login" 
                      onClick={closeMenu}
                      className="btn-login"
                    >
                      Вход
                    </Link>
                    <Link 
                      to="/register" 
                      className="btn-register" 
                      onClick={closeMenu}
                    >
                      Регистрация
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 