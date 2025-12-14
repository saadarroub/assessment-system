// src/main/react/core/router/routes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from '@/apps/landing/LandingPage';
import LoginPage from '@/features/auth/LoginPage';
import KatalogThemenPublic from '@/features/worker-area/KatalogThemenPublic';
import AdminDashboard from '@/features/admin-area/AdminDashboard';
import ProtectedRoute from './ProtectedRoute';
import ResultsPage from '@/features/worker-area/results/ResultsPage';
import AdminPanelPage from '@/features/admin-panel/AdminPanelPage';
import UserList from '@/features/admin-panel/users/UserList';
import UserDetailsPage from '@/features/admin-panel/users/UserDetail';
import CompaniesList from '@/features/admin-panel/companies/CompanyList';
import RoleList from '@/features/admin-panel/roles/RoleList';
import CompanyDetails from '@/features/admin-panel/companies/CompanyDetail';
import AuditPage from '@/features/admin-panel/audit/AuditLogTable';
import KatalogeZuweisen from '@/features/admin-area/KatalogeZuweisen';
import AssessmentPage from '@/features/worker-area/AssessmentPage';
import CompanyDetailPage from '@/features/worker-area/results/CompanyDetailPage';
import CompanyListPage from '@/features/worker-area/results/CompanyListPage';
import KatalogVerwaltung from '@/features/admin-area/KatalogVerwaltung';
import Zuweisungen from '@/features/admin-panel/companies/zuweisungen';
import InviteGate from '@/public/InviteGate';
import ZugewiesenerKatalog from '@/public/ZugewiesenerKatalogPagePublic';
import Ica3LandingSingle from '@/public/Ica3LandingSingle';
import { DashboardPage } from '@/apps/app/DashboardPage';

// Topic-Seiten
import EamPage from '@/features/admin-area/topics/eam/EamPage';
import OperatingModelPage from '@/features/admin-area/topics/operating-model/OperatingModelPage';
import SourcingPage from '@/features/admin-area/topics/sourcing/SourcingPage';
import ProjectManagementPage from '@/features/admin-area/topics/project-management/ProjectManagementPage';
import CompanyListtest from '@/features/admin-panel/companies/testcomplist';
import ConditionEditor from '@/features/admin-area/catalogs/ConditionEditor';
import CatalogList from '@/features/admin-area/catalogs/CatalogList';
import ReifegradPage from '@/features/admin-area/topics/reifegradmodelle/Reifegradmodelle';
import EmployeeProfile from '@/features/profile/ProfilePage';

<<<<<<< HEAD
import Ica3LandingPage from '@/apps/landing/Ica3LandingPage';
=======
import EmployeeCatalogsPage from '@/features/worker-area/results/EmployeeCatalogsPage'; 
>>>>>>> 33dd4906 (update Employee Catalogs)

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/startseite" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/invite/:token" element={<InviteGate />} />
      <Route path="/KatalogGate" element={<ZugewiesenerKatalog />} />

      
      <Route
	  path="/app/employee/:workerId"
	  element={
	    <ProtectedRoute>
	      <EmployeeCatalogsPage />
	    </ProtectedRoute>
	  }
	/>
	      

      <Route
        path="/app/reifegradmodelle"
        element={
          <ProtectedRoute>
            <ReifegradPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/app/katalog-themen-public"
        element={
          <ProtectedRoute allowWithToken>
            <KatalogThemenPublic />
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
    path="/admin/profile"
    element={
      <ProtectedRoute>
        <EmployeeProfile />
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

      <Route
        path="/app/companylist"
        element={
          <ProtectedRoute>
            <CompanyListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/app/assessments"
        element={
          <ProtectedRoute allowWithToken>
            <AssessmentPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/kataloge/verwaltung"
        element={
          <ProtectedRoute>
            <KatalogVerwaltung />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/katalogzuweisen"
        element={
          <ProtectedRoute>
            <KatalogeZuweisen />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/adminPanel"
        element={
          <ProtectedRoute>
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
            <AuditPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/adminPanel/roles"
        element={
          <ProtectedRoute>
            <RoleList />
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
        path="/admin/adminPanel/zuweisungen"
        element={
          <ProtectedRoute>
            <Zuweisungen />
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
          <ProtectedRoute>
            <EamPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/topics/operating-model"
        element={
          <ProtectedRoute>
            <OperatingModelPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/topics/sourcing"
        element={
          <ProtectedRoute>
            <SourcingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/topics/project-management"
        element={
          <ProtectedRoute>
            <ProjectManagementPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/catalogs/:id"
        element={
          <ProtectedRoute>
            <CatalogList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/catalogs/:id/condition-editor"
        element={
          <ProtectedRoute>
            <ConditionEditor />
          </ProtectedRoute>
        }
      />

      <Route
        path="/testComp"
        element={
          <ProtectedRoute>
            <CompanyListtest />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tests"
        element={
          <ProtectedRoute>
            <Ica3LandingPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
