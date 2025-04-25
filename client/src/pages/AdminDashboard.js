import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Container, Nav, Alert, Button, Badge, Table, Spinner } from 'react-bootstrap';
import DoctorCard from '../components/DoctorCard';
import ServiceCard from '../components/ServiceCard';
import DoctorForm from '../components/DoctorForm';
import ServiceForm from '../components/ServiceForm';
import './Dashboard.css';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Состояния для форм
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editingService, setEditingService] = useState(null);
  
  // Состояние для загрузки фото
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingDoctorId, setUploadingDoctorId] = useState(null);
  const [showPhotoUploadForm, setShowPhotoUploadForm] = useState(false);

  const { currentUser } = useAuth();
  
  // Загрузка данных
  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAppointments();
    } else if (activeTab === 'doctors') {
      fetchDoctors();
    } else if (activeTab === 'services') {
      fetchServices();
    }
  }, [activeTab]);
  
  // Загрузка записей
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/appointments', {
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
  
  // Загрузка врачей
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/doctors', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setDoctors(response.data);
      setLoading(false);
    } catch (error) {
      setError('Ошибка при загрузке списка врачей');
      setLoading(false);
      console.error('Ошибка:', error);
    }
  };
  
  // Загрузка услуг
  const fetchServices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/services', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setServices(response.data);
      setLoading(false);
    } catch (error) {
      setError('Ошибка при загрузке услуг');
      setLoading(false);
      console.error('Ошибка:', error);
    }
  };
  
  // Изменение статуса записи
  const updateAppointmentStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/appointments/${id}`, 
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Обновляем список записей
      fetchAppointments();
      showSuccessMessage('Статус записи успешно обновлен');
    } catch (error) {
      setError('Ошибка при обновлении статуса');
      console.error('Ошибка:', error);
    }
  };
  
  // Показ сообщения об успехе
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };
  
  // Добавление нового врача
  const handleAddDoctor = () => {
    setEditingDoctor(null);
    setShowDoctorForm(true);
  };
  
  // Редактирование врача
  const handleEditDoctor = (doctor) => {
    setEditingDoctor(doctor);
    setShowDoctorForm(true);
  };
  
  // Сохранение данных врача
  const handleSaveDoctor = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (editingDoctor) {
        // Редактирование существующего врача
        await axios.put(
          `http://localhost:5000/api/admin/doctors/${editingDoctor.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setSuccessMessage('Информация о враче успешно обновлена');
      } else {
        // Добавление нового врача
        await axios.post(
          'http://localhost:5000/api/admin/doctors',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setSuccessMessage('Врач успешно добавлен');
      }
      
      setShowDoctorForm(false);
      setEditingDoctor(null);
      fetchDoctors();
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка при сохранении данных врача');
      console.error('Ошибка:', error);
    }
  };
  
  // Удаление врача
  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого врача?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/doctors/${doctorId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Обновляем список врачей
      fetchDoctors();
      showSuccessMessage('Врач успешно удален');
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка при удалении врача');
      console.error('Ошибка:', error);
    }
  };
  
  // Добавление новой услуги
  const handleAddService = () => {
    setEditingService(null);
    setShowServiceForm(true);
  };
  
  // Редактирование услуги
  const handleEditService = (service) => {
    setEditingService(service);
    setShowServiceForm(true);
  };
  
  // Сохранение данных услуги
  const handleSaveService = async (serviceData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (editingService) {
        // Обновление существующей услуги
        await axios.put(
          `http://localhost:5000/api/admin/services/${editingService.id}`,
          serviceData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        showSuccessMessage('Услуга успешно обновлена');
      } else {
        // Создание новой услуги
        await axios.post(
          'http://localhost:5000/api/admin/services',
          serviceData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        showSuccessMessage('Услуга успешно добавлена');
      }
      
      // Закрываем форму и обновляем список услуг
      setShowServiceForm(false);
      fetchServices();
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка при сохранении услуги');
      console.error('Ошибка:', error);
    }
  };
  
  // Удаление услуги
  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту услугу?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/services/${serviceId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Обновляем список услуг
      fetchServices();
      showSuccessMessage('Услуга успешно удалена');
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка при удалении услуги');
      console.error('Ошибка:', error);
    }
  };
  
  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  // Получение статуса записи с соответствующим цветом
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning" className="status-badge">Ожидание</Badge>;
      case 'confirmed':
        return <Badge bg="primary" className="status-badge">Подтверждено</Badge>;
      case 'completed':
        return <Badge bg="success" className="status-badge">Завершено</Badge>;
      case 'canceled':
        return <Badge bg="danger" className="status-badge">Отменено</Badge>;
      default:
        return <Badge bg="secondary" className="status-badge">{status}</Badge>;
    }
  };
  
  // Загрузочный спиннер
  const LoadingSpinner = () => (
    <div className="loading-spinner">
      <Spinner animation="border" role="status" variant="primary">
        <span className="visually-hidden">Загрузка...</span>
      </Spinner>
    </div>
  );
  
  // Сообщение об отсутствии данных
  const EmptyMessage = ({ message }) => (
    <div className="empty-message">
      <p>{message}</p>
    </div>
  );

  // Обработчики для фотографий
  const handlePhotoUpload = (doctor) => {
    setUploadingDoctorId(doctor.id);
    setShowPhotoUploadForm(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadPhoto = async () => {
    if (!selectedFile || !uploadingDoctorId) {
      setError('Файл или врач не выбраны');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('photo', selectedFile);
      
      await axios.post(
        `http://localhost:5000/api/admin/doctors/${uploadingDoctorId}/photo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Обновляем список врачей
      fetchDoctors();
      
      // Очищаем состояние
      setSelectedFile(null);
      setUploadingDoctorId(null);
      setShowPhotoUploadForm(false);
      
      showSuccessMessage('Фотография успешно загружена');
    } catch (error) {
      setError('Ошибка при загрузке фотографии');
      console.error('Ошибка:', error);
    }
  };

  const cancelPhotoUpload = () => {
    setSelectedFile(null);
    setUploadingDoctorId(null);
    setShowPhotoUploadForm(false);
  };

  return (
    <Container fluid>
      <div className="admin-dashboard-container mb-4">
        <div className="admin-dashboard-tabs">
          <Nav variant="tabs" className="mb-0">
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'appointments'} 
                onClick={() => setActiveTab('appointments')}
              >
                <i className="far fa-calendar-check me-2"></i> Записи
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'doctors'} 
                onClick={() => setActiveTab('doctors')}
              >
                <i className="fas fa-user-md me-2"></i> Врачи
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'services'} 
                onClick={() => setActiveTab('services')}
              >
                <i className="fas fa-list-alt me-2"></i> Услуги
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'profile'} 
                onClick={() => setActiveTab('profile')}
              >
                <i className="fas fa-user-circle me-2"></i> Профиль
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </div>
        
        <div className="admin-dashboard-content">
          {/* Сообщения об ошибках и успехе */}
          {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
          {successMessage && <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>{successMessage}</Alert>}
          
          {/* Содержимое вкладок */}
          {activeTab === 'appointments' && (
            <div>
              <div className="section-header">
                <h2><i className="far fa-calendar-check me-2"></i> Управление записями</h2>
              </div>
              
              {loading ? (
                <LoadingSpinner />
              ) : appointments.length === 0 ? (
                <EmptyMessage message="Записей не найдено" />
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th><i className="fas fa-user me-1"></i> Пациент</th>
                        <th><i className="fas fa-address-card me-1"></i> Контакты</th>
                        <th><i className="fas fa-user-md me-1"></i> Врач</th>
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
                            <div><i className="fas fa-phone-alt me-1 text-muted"></i> {appointment.phone}</div>
                            <div><i className="fas fa-envelope me-1 text-muted"></i> {appointment.email}</div>
                          </td>
                          <td>{appointment.doctor_name}</td>
                          <td>{appointment.service_name}</td>
                          <td>{formatDate(appointment.appointment_date)}</td>
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'doctors' && (
            <div>
              <div className="section-header">
                <h2><i className="fas fa-user-md me-2"></i> Управление врачами</h2>
                <Button variant="primary" onClick={handleAddDoctor}>
                  <i className="fas fa-plus me-1"></i> Добавить врача
                </Button>
              </div>
              
              {loading ? (
                <LoadingSpinner />
              ) : doctors.length === 0 ? (
                <EmptyMessage message="Врачей не найдено. Нажмите 'Добавить врача', чтобы создать нового врача." />
              ) : (
                <div className="admin-doctors-list">
                  {doctors.map(doctor => (
                    <DoctorCard 
                      key={doctor.id}
                      doctor={doctor}
                      onEdit={handleEditDoctor}
                      onDelete={handleDeleteDoctor}
                      onPhotoUpload={handlePhotoUpload}
                    />
                  ))}
                </div>
              )}
              
              {showDoctorForm && (
                <DoctorForm 
                  doctor={editingDoctor}
                  onSave={handleSaveDoctor}
                  onCancel={() => setShowDoctorForm(false)}
                />
              )}
              
              {/* Модальное окно для загрузки фотографии */}
              {showPhotoUploadForm && (
                <div className="form-modal">
                  <div className="form-container">
                    <h3>Загрузка фотографии</h3>
                    <div className="mb-4">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="form-control"
                      />
                      <small className="text-muted d-block mt-2">
                        <i className="fas fa-info-circle me-1"></i>
                        Поддерживаемые форматы: JPG, PNG, GIF. Максимальный размер: 5 МБ
                      </small>
                    </div>
                    
                    {selectedFile && (
                      <div className="mb-4 text-center">
                        <h5>Предпросмотр:</h5>
                        <img 
                          src={URL.createObjectURL(selectedFile)} 
                          alt="Предпросмотр" 
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '200px', 
                            borderRadius: '8px', 
                            border: '2px solid var(--primary-light)' 
                          }} 
                        />
                      </div>
                    )}
                    
                    <div className="form-actions">
                      <Button variant="secondary" onClick={cancelPhotoUpload}>
                        Отмена
                      </Button>
                      <Button 
                        variant="primary" 
                        onClick={uploadPhoto}
                        disabled={!selectedFile}
                      >
                        <i className="fas fa-upload me-1"></i> Загрузить
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'services' && (
            <div>
              <div className="section-header">
                <h2><i className="fas fa-list-alt me-2"></i> Управление услугами</h2>
                <Button variant="primary" onClick={handleAddService}>
                  <i className="fas fa-plus me-1"></i> Добавить услугу
                </Button>
              </div>
              
              {loading ? (
                <LoadingSpinner />
              ) : services.length === 0 ? (
                <EmptyMessage message="Услуг не найдено. Нажмите 'Добавить услугу', чтобы создать новую услугу." />
              ) : (
                <div className="admin-services-list">
                  {services.map(service => (
                    <ServiceCard 
                      key={service.id}
                      service={service}
                      onEdit={handleEditService}
                      onDelete={handleDeleteService}
                    />
                  ))}
                </div>
              )}
              
              {showServiceForm && (
                <ServiceForm 
                  service={editingService}
                  onSave={handleSaveService}
                  onCancel={() => setShowServiceForm(false)}
                />
              )}
            </div>
          )}
          
          {activeTab === 'profile' && (
            <div>
              <div className="section-header">
                <h2><i className="fas fa-user-circle me-2"></i> Профиль администратора</h2>
              </div>
              
              <div className="admin-card">
                <div className="admin-card-body">
                  <h4>Данные учетной записи</h4>
                  <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fas fa-envelope" style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}></i>
                      <span><strong>Email:</strong> {currentUser?.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fas fa-user-shield" style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}></i>
                      <span><strong>Роль:</strong> Администратор</span>
                    </div>
                  </div>
                  <p className="mb-0 text-muted">
                    <i className="fas fa-info-circle me-1"></i>
                    Администратор имеет полный доступ к управлению клиникой, 
                    включая управление врачами, услугами и записями пациентов.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default AdminDashboard; 