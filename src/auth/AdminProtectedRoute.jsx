// src/auth/AdminProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn');

  if (isAdminLoggedIn !== 'true') {
    // If not logged in, redirect to the admin login page
    return <Navigate to="/admin/login" replace />;
  }

  // If logged in, render the child components
  return children;
};

export default AdminProtectedRoute;
