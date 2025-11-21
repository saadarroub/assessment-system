import { useCallback, useState } from 'react';
import { usePermissionError } from '@/core/auth/hooks/usePermissionError';
import type { PermissionDeniedEvent } from '@/core/auth/PermissionEventBus';
import { Toast } from './Toast';

/**
 * Global Toast Listener nur für Aktionen (POST, PUT, DELETE)
 * GET-Requests werden in der jeweiligen Komponente behandelt
 */
export function PermissionToastListener() {
  const [toastEvent, setToastEvent] = useState<PermissionDeniedEvent | null>(null);

  const handlePermissionDenied = useCallback((evt: PermissionDeniedEvent) => {
    // Nur Toast für Aktionen (nicht GET)
    if (!evt.isGetRequest) {
      setToastEvent(evt);
    }
    // GET-Requests werden von den Komponenten selbst behandelt
  }, []);

  usePermissionError(handlePermissionDenied);

  if (!toastEvent) {
    return null;
  }

  return (
    <Toast
      message="Keine Berechtigung für diese Aktion"
      type="warning"
      duration={4000}
      onClose={() => setToastEvent(null)}
    />
  );
}
