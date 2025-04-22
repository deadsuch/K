import React from 'react';
import { Button } from 'react-bootstrap';
import '../pages/AdminDashboard.css';

const DoctorCard = ({ doctor, onEdit, onDelete, onPhotoUpload }) => {
  const serverUrl = 'http://localhost:5000';
  
  return (
    <div className="admin-card">
      <div className="admin-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ color: 'var(--primary-color)', marginBottom: '15px', fontWeight: '600' }}>
              <i className="fas fa-user-md me-2"></i> {doctor.full_name}
            </h4>
            <p style={{ color: 'var(--accent-color)', fontWeight: '500', marginBottom: '10px' }}>
              <i className="fas fa-stethoscope me-2"></i> {doctor.specialization}
            </p>
            <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-envelope" style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}></i>
                <span>{doctor.email}</span>
              </div>
              {doctor.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-phone-alt" style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}></i>
                  <span>{doctor.phone}</span>
                </div>
              )}
              {doctor.experience && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-calendar-check" style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}></i>
                  <span>Опыт работы: {doctor.experience} лет</span>
                </div>
              )}
            </div>
            {doctor.description && (
              <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginBottom: '0' }}>
                <i className="fas fa-info-circle me-2" style={{ color: 'var(--primary-color)' }}></i>
                {doctor.description}
              </p>
            )}
          </div>
          <div 
            className="doctor-photo-container"
            style={{ 
              width: '120px', 
              height: '120px', 
              overflow: 'hidden', 
              marginLeft: '20px',
              borderRadius: '12px',
              boxShadow: 'var(--shadow)',
              border: '2px solid var(--primary-light)',
              position: 'relative'
            }}
          >
            {doctor.photo_url ? (
              <img 
                src={`${serverUrl}${doctor.photo_url}`} 
                alt={doctor.full_name} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover'
                }} 
              />
            ) : (
              <div style={{ 
                width: '100%', 
                height: '100%', 
                backgroundColor: 'var(--primary-light)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--primary-color)',
                fontSize: '2.5rem'
              }}>
                <i className="fas fa-user-md"></i>
              </div>
            )}
            <Button 
              variant="primary" 
              size="sm" 
              className="change-photo-btn"
              onClick={() => onPhotoUpload(doctor)}
              style={{
                position: 'absolute',
                bottom: '5px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '90%',
                fontSize: '0.75rem',
                padding: '2px 5px',
                backgroundColor: 'rgba(45, 130, 183, 0.9)',
                borderColor: 'transparent'
              }}
            >
              <i className="fas fa-camera me-1"></i> Изменить фото
            </Button>
          </div>
        </div>
      </div>
      <div className="admin-card-actions">
        <Button variant="outline-primary" size="sm" onClick={() => onEdit(doctor)}>
          <i className="fas fa-edit me-1"></i> Редактировать
        </Button>
        <Button variant="outline-danger" size="sm" onClick={() => onDelete(doctor.id)}>
          <i className="fas fa-trash-alt me-1"></i> Удалить
        </Button>
      </div>
    </div>
  );
};

export default DoctorCard; 