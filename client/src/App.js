import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Компоненты страниц
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import BookAppointment from './pages/BookAppointment';
import Services from './pages/Services';
import Doctors from './pages/Doctors';
import NotFound from './pages/NotFound';

// Auth контекст
import { AuthProvider, useAuth } from './context/AuthContext';

// Компонент защищенного маршрута
const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // Если роль не соответствует, перенаправляем на соответствующую панель
    if (userRole === 'admin') {
      return <Navigate to="/admin" />;
    } else if (userRole === 'doctor') {
      return <Navigate to="/doctor" />;
    } else if (userRole === 'patient') {
      return <Navigate to="/dashboard" />;
    }
    
    // Если ни одно из условий не сработало, перенаправляем на главную
    return <Navigate to="/" />;
  }

  return children;
};

// Компонент маршрутизации панели управления в зависимости от роли
const DashboardRouter = () => {
  const { userRole } = useAuth();
  
  // Перенаправляем на соответствующую панель управления в зависимости от роли
  if (userRole === 'admin') {
    return <Navigate to="/admin" />;
  } else if (userRole === 'doctor') {
    return <Navigate to="/doctor" />;
  } else if (userRole === 'patient') {
    return <Navigate to="/dashboard" />;
  }
  
  // По умолчанию, если роль неизвестна или не предусмотрена, перенаправляем на главную
  return <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              {/* Общедоступные маршруты */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/services" element={<Services />} />
              <Route path="/doctors" element={<Doctors />} />

              {/* Роутер для определения правильной панели управления */}
              <Route path="/dashboard-router" element={<DashboardRouter />} />

              {/* Приватные маршруты для пациентов */}
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute requiredRole="patient">
                    <PatientDashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/book-appointment" 
                element={
                  <PrivateRoute requiredRole="patient">
                    <BookAppointment />
                  </PrivateRoute>
                } 
              />

              {/* Приватные маршруты для администратора */}
              <Route 
                path="/admin" 
                element={
                  <PrivateRoute requiredRole="admin">
                    <AdminDashboard />
                  </PrivateRoute>
                } 
              />

              {/* Приватные маршруты для врачей */}
              <Route 
                path="/doctor" 
                element={
                  <PrivateRoute requiredRole="doctor">
                    <DoctorDashboard />
                  </PrivateRoute>
                } 
              />

              {/* Обработка 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <footer className="footer">
            <div className="container">
              <p>&copy; {new Date().getFullYear()} Стоматологическая клиника. Все права защищены.</p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 