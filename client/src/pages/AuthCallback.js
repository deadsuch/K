import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updateUserProfile } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    if (token) {
      // Сохраняем токен в localStorage
      localStorage.setItem('token', token);
      
      // Обновляем информацию о пользователе в контексте авторизации
      updateUserProfile({ id: userId, role });
      
      // Редиректим на главную страницу
      navigate('/');
    } else {
      // Если токен не найден, редиректим на страницу логина
      navigate('/login');
    }
  }, [searchParams, navigate, updateUserProfile]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 2
      }}
    >
      <CircularProgress />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Выполняем вход...
      </Typography>
    </Box>
  );
};

export default AuthCallback; 