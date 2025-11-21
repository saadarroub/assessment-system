import { useState, useEffect } from 'react';
import { AxiosError } from 'axios';

export interface UsePermissionErrorResult {
  hasPermissionError: boolean;
  errorMessage: string | null;
  clearError: () => void;
}

/**
 * Hook für Permission-Errors in Komponenten
 * Prüft ob ein Error ein 403-Permission-Error ist
 */
export function useComponentPermissionError(error: Error | AxiosError | null | undefined): UsePermissionErrorResult {
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!error) {
      setHasPermissionError(false);
      setErrorMessage(null);
      return;
    }

    // Check if it's a 403 error
    const is403 = 
      (error as AxiosError)?.response?.status === 403 ||
      error.message?.includes('403') ||
      error.message?.toLowerCase().includes('forbidden');

    if (is403) {
      setHasPermissionError(true);
      const responseData = (error as AxiosError)?.response?.data as { message?: string } | undefined;
      setErrorMessage(responseData?.message || 'Sie haben keine Berechtigung für diese Daten.');
    } else {
      setHasPermissionError(false);
      setErrorMessage(null);
    }
  }, [error]);

  const clearError = () => {
    setHasPermissionError(false);
    setErrorMessage(null);
  };

  return { hasPermissionError, errorMessage, clearError };
}
