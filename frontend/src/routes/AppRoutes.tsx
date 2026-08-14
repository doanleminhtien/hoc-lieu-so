import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LandingPage } from '../pages/LandingPage';
import { MaterialsPage } from '../pages/MaterialsPage';
import { MaterialDetailPage } from '../pages/MaterialDetailPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { AdminDashboard } from '../pages/AdminDashboard';
import { LecturerDashboard } from '../pages/LecturerDashboard';
import { StudentDashboard } from '../pages/StudentDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">Đang tải...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role_name)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/materials" element={<MaterialsPage />} />
      <Route path="/materials/:id" element={<MaterialDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/lecturer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['LECTURER', 'ADMIN']}>
            <LecturerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={['STUDENT', 'LECTURER', 'ADMIN']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
