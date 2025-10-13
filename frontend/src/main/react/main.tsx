import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from "@/core/auth/AuthContext";
import '@/styles/index.css';
import AppShell from '@/apps/app/AppShell';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
   <AuthProvider>
      <AppShell />
    </AuthProvider>
  </StrictMode>
);
