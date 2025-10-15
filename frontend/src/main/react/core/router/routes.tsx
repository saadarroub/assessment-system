// src/main/react/core/router/routes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '@/apps/landing/LandingPage';
import LoginPage from '@/features/auth/LoginPage';
import WorkerDashboard from '@/features/worker-area/WorkerDashboard';
import AdminDashboard from '@/features/admin-area/AdminDashboard';
import ProtectedRoute from './ProtectedRoute';
import ResultsPage from '@/features/worker-area/results/ResultsPage';
import AdminPanelPage from '@/features/admin-panel/AdminPanelPage';
import UserList from '@/features/admin-panel/users/UserList';
import UserDetailsPage from '@/features/admin-panel/users/UserDetail';
import CompaniesList from '@/features/admin-panel/companies/CompanyList';
import CompanyDetails from '@/features/admin-panel/companies/CompanyDetail';
import AuditPage from '@/features/admin-panel/audit/AuditLogTable';
import KatalogeZuweisen from '@/features/admin-area/KatalogeZuweisen';
import TestSliderNav from '@/apps/app/TestSliderNav';
import CompanyDetailPage from '@/features/worker-area/results/CompanyDetailPage';
import CompanyListPage from '@/features/worker-area/results/CompanyListPage';

// ⬇️ Topic-Seiten
import EamPage from '@/features/admin-area/topics/eam/EamPage';
import OperatingModelPage from '@/features/admin-area/topics/operating-model/OperatingModelPage';
import SourcingPage from '@/features/admin-area/topics/sourcing/SourcingPage';
import ProjectManagementPage from '@/features/admin-area/topics/project-management/ProjectManagementPage';
import CompanyListtest from '@/features/admin-panel/companies/testcomplist';


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/app/dashboard"
        element={
          <ProtectedRoute permission="user:dashboard:view">
            <WorkerDashboard />
          </ProtectedRoute>
        }
      />      
      <Route
        path="/app/result/:companyId"
        element={
          <ProtectedRoute>
            <CompanyDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/results/:sessionId"
        element={
          <ProtectedRoute  permission="user:dashboard:view">
            <ResultsPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/app/companylist/"
        element={
          <ProtectedRoute>
            <CompanyListPage />
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
      <Route
  path="/admin/katalogzuweisen"
  element={
    <ProtectedRoute permission="admin:dashboard:view">
      <KatalogeZuweisen />
    </ProtectedRoute>
  }
/>
      <Route
        path="/admin/adminPanel"
        element={
          <ProtectedRoute permission="admin:dashboard:view">
            <AdminPanelPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/adminPanel/users"
        element={
          <ProtectedRoute>
            <UserList />
          </ProtectedRoute>
        }
      />
       <Route
        path="/admin/adminPanel/users/:id"
        element={
          <ProtectedRoute>
            <UserDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/adminPanel/audit"
        element={
          <ProtectedRoute>
            < AuditPage/>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/adminPanel/companies"
        element={
          <ProtectedRoute>
            <CompaniesList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/adminPanel/companies/:id"
        element={
          <ProtectedRoute>
            <CompanyDetails />
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
       <Route
        path="/testComp"
        element={
          <ProtectedRoute permission="user:dashboard:view">
            <CompanyListtest/>
          </ProtectedRoute>
        }
      />
  
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
