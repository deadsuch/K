import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Container, Alert, Button, Badge, Table, Spinner } from 'react-bootstrap';
import ProfileEdit from '../../components/ProfileEdit';
import { API_URL } from '../../config';
import '../Dashboard.css';
import '../AdminDashboard.css';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showEditProfile, setShowEditProfile] = useState(false);

  const { currentUser, updateUserProfile } = useAuth();
  
  // Загрузка данных
  useEffect(() => {
    fetchDoctorAppointments();
  }, []);
  
  // Загрузка записей для текущего врача
  const fetchDoctorAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/doctor/appointments`, {
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
  
  // Обновление статуса записи
  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/doctor/appointments/${appointmentId}`, 
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Обновляем список записей после изменения статуса
      fetchDoctorAppointments();
      showSuccessMessage(`Статус записи успешно обновлен на "${getStatusLabel(status)}"`);
    } catch (error) {
      setError('Ошибка при обновлении статуса записи');
      console.error('Ошибка:', error);
    }
  };
  
  // Отображение сообщения об успешном действии
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    // Скрываем сообщение через 3 секунды
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };
  
  // Компонент индикатора загрузки
  const LoadingSpinner = () => (
    <div className="loading-spinner">
      <Spinner animation="border" variant="primary" />
      <span className="ms-2">Загрузка данных...</span>
    </div>
  );
  
  // Получение метки для статуса
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Ожидает подтверждения';
      case 'confirmed': return 'Подтверждена';
      case 'completed': return 'Завершена';
      case 'canceled': return 'Отменена';
      default: return status;
    }
  };
  
  // Получение цвета бейджа в зависимости от статуса
  const getStatusBadge = (status) => {
    let variant;
    switch (status) {
      case 'pending':
        variant = 'warning';
        break;
      case 'confirmed':
        variant = 'primary';
        break;
      case 'completed':
        variant = 'success';
        break;
      case 'canceled':
        variant = 'danger';
        break;
      default:
        variant = 'secondary';
    }
    
    return (
      <Badge className="status-badge" bg={variant}>
        {getStatusLabel(status)}
      </Badge>
    );
  };
  
  // Сообщение об отсутствии данных
  const EmptyMessage = ({ message }) => (
    <div className="empty-message">
      <p>{message}</p>
    </div>
  );
  
  // Обработчик обновления профиля
  const handleProfileUpdate = (updatedUser) => {
    updateUserProfile(updatedUser);
    showSuccessMessage('Профиль успешно обновлен');
  };
  
  return (
    <Container fluid>
      <div className="admin-dashboard-container mb-4">
        <div className="admin-dashboard-content">
          {/* Сообщения об ошибках и успехе */}
          {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
          {successMessage && <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>{successMessage}</Alert>}
          
          {/* Заголовок */}
          <div className="section-header">
            <h2><i className="far fa-calendar-check me-2"></i> Мои записи на прием</h2>
          </div>
          
          {/* Список записей */}
          {loading ? (
            <LoadingSpinner />
          ) : appointments.length === 0 ? (
            <EmptyMessage message="У вас пока нет записей на прием" />
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th><i className="fas fa-user me-1"></i> Пациент</th>
                    <th><i className="fas fa-address-card me-1"></i> Контакты</th>
                    <th><i className="fas fa-tooth me-1"></i> Услуга</th>
                    <th><i className="far fa-clock me-1"></i> Дата и время</th>
                    <th><i className="fas fa-info-circle me-1"></i> Статус</th>
                    <th><i className="fas fa-cogs me-1"></i> Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(appointment => (
                    <tr key={appointment.id}>
                      <td>{appointment.patient_name}</td>
                      <td>
                        {appointment.phone && <div><i className="fas fa-phone-alt me-1 text-muted"></i> {appointment.phone}</div>}
                        {appointment.email && <div><i className="fas fa-envelope me-1 text-muted"></i> {appointment.email}</div>}
                      </td>
                      <td>{appointment.service_name}</td>
                      <td>{`${appointment.appointment_date} ${appointment.appointment_time}`}</td>
                      <td>{getStatusBadge(appointment.status)}</td>
                      <td>
                        {appointment.status === 'pending' && (
                          <>
                            <Button 
                              variant="outline-success" 
                              size="sm" 
                              className="action-button"
                              onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                            >
                              <i className="fas fa-check me-1"></i> Подтвердить
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              className="action-button"
                              onClick={() => updateAppointmentStatus(appointment.id, 'canceled')}
                            >
                              <i className="fas fa-times me-1"></i> Отменить
                            </Button>
                          </>
                        )}
                        {appointment.status === 'confirmed' && (
                          <>
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              className="action-button"
                              onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                            >
                              <i className="fas fa-check-double me-1"></i> Завершить
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              className="action-button"
                              onClick={() => updateAppointmentStatus(appointment.id, 'canceled')}
                            >
                              <i className="fas fa-times me-1"></i> Отменить
                            </Button>
                          </>
                        )}
                        {appointment.status === 'completed' && (
                          <span className="text-muted">Прием завершен</span>
                        )}
                        {appointment.status === 'canceled' && (
                          <span className="text-muted">Запись отменена</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
          
          {/* Профиль врача */}
          <div className="mt-5 section-header">
            <h2>
              <i className="fas fa-user-md me-2"></i> Профиль врача
              <Button 
                variant="outline-primary" 
                size="sm" 
                className="ms-3"
                onClick={() => setShowEditProfile(true)}
              >
                <i className="fas fa-edit me-1"></i> Редактировать профиль
              </Button>
            </h2>
          </div>
          
          <div className="admin-card">
            <div className="admin-card-body">
              <h4>Данные учетной записи</h4>
              <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-user" style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}></i>
                  <span><strong>ФИО:</strong> {currentUser?.full_name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-envelope" style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}></i>
                  <span><strong>Email:</strong> {currentUser?.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-phone" style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}></i>
                  <span><strong>Телефон:</strong> {currentUser?.phone || 'Не указан'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-user-md" style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}></i>
                  <span><strong>Роль:</strong> Врач</span>
                </div>
              </div>
              <p className="mb-0 text-muted">
                <i className="fas fa-info-circle me-1"></i>
                В этой панели вы можете управлять своими записями на прием: подтверждать, отменять или отмечать прием как завершенный.
              </p>
            </div>
          </div>
          
          {/* Модальное окно редактирования профиля */}
          {showEditProfile && (
            <div className="profile-edit-overlay">
              <ProfileEdit 
                onCancel={() => setShowEditProfile(false)}
                onProfileUpdate={(user) => {
                  handleProfileUpdate(user);
                  setShowEditProfile(false);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default DoctorDashboard; 