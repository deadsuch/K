import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Страница не найдена</h2>
        <p>Извините, запрашиваемая страница не существует или была перемещена.</p>
        <Link to="/" className="btn btn-primary">Вернуться на главную</Link>
      </div>
    </div>
  );
};

export default NotFound; 