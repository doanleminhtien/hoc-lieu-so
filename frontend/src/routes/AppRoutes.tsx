import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AcademicLayout } from '../components/layout/AcademicLayout';
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
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-xs font-semibold">
        Đang tải hệ thống...
      </div>
    );
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
      {/* Auth Pages (Standalone Full Screen) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Main Workspace Pages wrapped in AcademicLayout */}
      <Route
        path="/"
        element={
          <AcademicLayout>
            <LandingPage />
          </AcademicLayout>
        }
      />
      <Route
        path="/materials"
        element={
          <AcademicLayout>
            <MaterialsPage />
          </AcademicLayout>
        }
      />
      <Route
        path="/materials/:id"
        element={
          <AcademicLayout>
            <MaterialDetailPage />
          </AcademicLayout>
        }
      />

      {/* Protected Workspaces */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AcademicLayout>
              <AdminDashboard />
            </AcademicLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/lecturer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['LECTURER', 'ADMIN']}>
            <AcademicLayout>
              <LecturerDashboard />
            </AcademicLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={['STUDENT', 'LECTURER', 'ADMIN']}>
            <AcademicLayout>
              <StudentDashboard />
            </AcademicLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
