import React from 'react';
import { Button } from 'react-bootstrap';
import '../pages/AdminDashboard.css';

const ServiceCard = ({ service, onEdit, onDelete }) => {
  // Функция для получения иконки в зависимости от имени услуги
  const getServiceIcon = (serviceName) => {
    const name = serviceName.toLowerCase();
    
    if (name.includes('чистка') || name.includes('гигиен') || name.includes('профилактик'))
      return 'fa-shield-alt';
    
    if (name.includes('лечение') || name.includes('пломб') || name.includes('кариес'))
      return 'fa-tools';
    
    if (name.includes('протез'))
      return 'fa-crown';
    
    if (name.includes('имплант'))
      return 'fa-teeth';
    
    if (name.includes('отбел') || name.includes('винир') || name.includes('эстет'))
      return 'fa-magic';
    
    if (name.includes('дети') || name.includes('детск'))
      return 'fa-baby';
    
    if (name.includes('удал') || name.includes('хирург'))
      return 'fa-tooth';
    
    if (name.includes('рентген') || name.includes('диагност'))
      return 'fa-x-ray';
    
    // Иконка по умолчанию
    return 'fa-star';
  };
  
  return (
    <div className="admin-card">
      <div className="admin-card-body">
        <h4 style={{ color: 'var(--primary-color)', marginBottom: '15px', fontWeight: '600' }}>
          <i className={`fas ${getServiceIcon(service.name)} me-2`}></i> {service.name}
        </h4>
        
        <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-ruble-sign" style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}></i>
            <span style={{ fontWeight: '500' }}>{service.price} руб.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="far fa-clock" style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}></i>
            <span>{service.duration} мин.</span>
          </div>
        </div>
        
        {service.description ? (
          <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginBottom: '0' }}>
            <i className="fas fa-info-circle me-2" style={{ color: 'var(--primary-color)' }}></i>
            {service.description}
          </p>
        ) : (
          <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginBottom: '0', fontStyle: 'italic' }}>
            <i className="fas fa-info-circle me-2" style={{ color: 'var(--primary-color)' }}></i>
            Описание отсутствует
          </p>
        )}
      </div>
      <div className="admin-card-actions">
        <Button variant="outline-primary" size="sm" onClick={() => onEdit(service)}>
          <i className="fas fa-edit me-1"></i> Редактировать
        </Button>
        <Button variant="outline-danger" size="sm" onClick={() => onDelete(service.id)}>
          <i className="fas fa-trash-alt me-1"></i> Удалить
        </Button>
      </div>
    </div>
  );
};

export default ServiceCard; 