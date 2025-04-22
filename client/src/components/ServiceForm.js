import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';

const ServiceForm = ({ service, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
    description: '',
  });

  useEffect(() => {
    if (service) {
      // Если передана услуга для редактирования, заполняем форму ее данными
      setFormData({
        name: service.name || '',
        price: service.price || '',
        duration: service.duration || '',
        description: service.description || '',
      });
    }
  }, [service]);

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
    if (!formData.name || !formData.price || !formData.duration) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    // Проверяем, что цена и продолжительность - положительные числа
    if (parseFloat(formData.price) <= 0 || parseInt(formData.duration) <= 0) {
      alert('Цена и продолжительность должны быть положительными числами');
      return;
    }
    
    // Преобразуем цену и продолжительность в числа
    const serviceData = {
      ...formData,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration)
    };
    
    // Отправляем данные формы
    onSave(serviceData);
  };

  return (
    <div className="form-modal">
      <div className="form-container">
        <h3>{service ? 'Редактировать услугу' : 'Добавить новую услугу'}</h3>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Название услуги *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Стоимость (руб.) *</Form.Label>
            <Form.Control
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Продолжительность (мин.) *</Form.Label>
            <Form.Control
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              min="1"
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
              placeholder="Описание услуги (необязательно)"
            />
          </Form.Group>
          
          <div className="form-actions">
            <Button variant="secondary" onClick={onCancel}>
              Отмена
            </Button>
            <Button variant="primary" type="submit">
              {service ? 'Сохранить изменения' : 'Добавить услугу'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ServiceForm; 