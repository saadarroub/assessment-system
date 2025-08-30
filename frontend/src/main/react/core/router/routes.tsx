// src/main/react/core/router/routes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '@/apps/landing/LandingPage';
import LoginPage from '@/features/auth/LoginPage';
import WorkerDashboard from '@/features/worker-area/WorkerDashboard';
import AdminDashboard from '@/features/admin-area/AdminDashboard';
import ProtectedRoute from './ProtectedRoute';
import ResultsPage from '@/features/worker-area/results/ResultsPage';

// ⬇️ Topic-Seiten
import EamPage from '@/features/admin-area/topics/eam/EamPage';
import OperatingModelPage from '@/features/admin-area/topics/operating-model/OperatingModelPage';
import SourcingPage from '@/features/admin-area/topics/sourcing/SourcingPage';
import ProjectManagementPage from '@/features/admin-area/topics/project-management/ProjectManagementPage';

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
        path="/app/results/:sessionId"
        element={
          <ProtectedRoute>
            <ResultsPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute permission="admin:dashboard:view">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Topics */}
      <Route
        path="/admin/topics/eam"
        element={
          <ProtectedRoute permission="admin:dashboard:view">
            <EamPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/topics/operating-model"
        element={
          <ProtectedRoute permission="admin:dashboard:view">
            <OperatingModelPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/topics/sourcing"
        element={
          <ProtectedRoute permission="admin:dashboard:view">
            <SourcingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/topics/project-management"
        element={
          <ProtectedRoute permission="admin:dashboard:view">
            <ProjectManagementPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
