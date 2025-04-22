import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';

const DoctorForm = ({ doctor, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    specialization: '',
    email: '',
    password: '',
    phone: '',
    experience: '',
    description: ''
  });

  useEffect(() => {
    if (doctor) {
      // Если передан доктор для редактирования, заполняем форму его данными
      setFormData({
        fullName: doctor.full_name || '',
        specialization: doctor.specialization || '',
        email: doctor.email || '',
        password: '', // Пароль не заполняем при редактировании
        phone: doctor.phone || '',
        experience: doctor.experience || '',
        description: doctor.description || ''
      });
    }
  }, [doctor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Проверяем обязательные поля
    if (!formData.fullName || !formData.specialization || !formData.email) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    // Если это новый врач, проверяем пароль
    if (!doctor && !formData.password) {
      alert('Пожалуйста, укажите пароль для нового врача');
      return;
    }
    
    // Отправляем данные формы
    onSave(formData);
  };

  return (
    <div className="form-modal">
      <div className="form-container">
        <h3>{doctor ? 'Редактировать врача' : 'Добавить нового врача'}</h3>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>ФИО врача *</Form.Label>
            <Form.Control
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Специализация *</Form.Label>
            <Form.Control
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Email *</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Form.Text className="text-muted">
              Email будет использоваться для входа в систему
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>{doctor ? 'Новый пароль (оставьте пустым, чтобы не менять)' : 'Пароль *'}</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!doctor}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Телефон</Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Опыт работы (лет)</Form.Label>
            <Form.Control
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              min="0"
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Описание</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Описание врача (необязательно)"
            />
          </Form.Group>
          
          <div className="form-actions">
            <Button variant="secondary" onClick={onCancel}>
              Отмена
            </Button>
            <Button variant="primary" type="submit">
              {doctor ? 'Сохранить изменения' : 'Добавить врача'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default DoctorForm; 