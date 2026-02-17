// src/main/react/apps/app/AppShell.tsx
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '@/core/router/routes';
import { AuthProvider } from '@/core/auth/AuthContext';
import { PermissionToastListener } from '@/shared/components/PermissionToast';
import { ToastProvider } from '@/shared/contexts/ToastContext';

export default function AppShell() {
  return (
    <AuthProvider>
      <ToastProvider>
        <PermissionToastListener />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
