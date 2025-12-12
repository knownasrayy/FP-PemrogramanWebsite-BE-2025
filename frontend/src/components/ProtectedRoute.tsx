import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect ke login kalo belum login
    return <Navigate to="/login" replace />;
  }

  // Kalo udah login, tampilkan halamannya
  return <Outlet />;
};

export default ProtectedRoute;