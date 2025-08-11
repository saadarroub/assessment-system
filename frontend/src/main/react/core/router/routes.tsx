// src/main/react/core/router/routes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '@/apps/landing/LandingPage';
import LoginPage from '@/features/auth/LoginPage';
import WorkerDashboard from '@/features/worker-area/WorkerDashboard';
import AdminDashboard from '@/features/admin-area/AdminDashboard';
import ProtectedRoute from './ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/app/dashboard"
        element={
          <ProtectedRoute>
            <WorkerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute permission="admin:dashboard:view">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
