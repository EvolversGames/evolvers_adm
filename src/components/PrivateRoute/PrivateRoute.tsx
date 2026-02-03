// src/components/PrivateRoute/PrivateRoute.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './PrivateRoute.css';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Enquanto valida o token, mostra loading
  if (isLoading) {
    return (
      <div className="auth-gate">
        <div className="auth-gate-card">
          <div className="auth-gate-spinner" />
          <h2>Evolvers Admin</h2>
          <p>Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Verifica se está autenticado E se é admin
  const isAdmin = isAuthenticated && user?.role === 'admin';

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
