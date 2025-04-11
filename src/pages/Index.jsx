
import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import Login from '@/components/Auth/Login';

const Index = () => {
  const isAuthenticated = authService.isAuthenticated();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Login />;
};

export default Index;
