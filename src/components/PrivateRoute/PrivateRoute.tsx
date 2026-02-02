// src/components/PrivateRoute/PrivateRoute.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Enquanto valida o token, mostra loading
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--bg-body, #222736)',
        color: 'var(--text-primary, #aab8c5)'
      }}>
        Verificando autenticação...
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
