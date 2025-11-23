

import { useEffect } from 'react';
import { PermissionEventBus } from '../PermissionEventBus';
import type { PermissionDeniedEvent } from '../PermissionEventBus';

export function usePermissionError(
  onError?: (event: PermissionDeniedEvent) => void
): void {
  useEffect(() => {
    if (!onError) return;

    // Subscribe to Permission-Denied-Events
    const unsubscribe = PermissionEventBus.subscribe(onError);

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [onError]);
}
