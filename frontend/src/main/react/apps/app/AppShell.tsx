// src/main/react/apps/app/AppShell.tsx
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '@/core/router/routes';
import { AuthProvider } from '@/core/auth/AuthContext';

export default function AppShell() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
