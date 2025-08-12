import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // ログインページにリダイレクトし、元のページを記憶
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 必要な権限をチェック
  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    // 権限不足の場合はダッシュボードにリダイレクト
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};