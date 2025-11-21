import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';

export interface PermissionErrorProps {
  error?: Error | AxiosError | null;
  message?: string;
}

/**
 * Component to show red permission error text in tables/lists
 */
export function PermissionError({ error, message }: PermissionErrorProps) {
  const [isPermissionError, setIsPermissionError] = useState(false);

  useEffect(() => {
    if (!error) {
      setIsPermissionError(false);
      return;
    }

    // Check if it's a 403 error
    const is403 = 
      (error as AxiosError)?.response?.status === 403 ||
      error.message?.includes('403') ||
      error.message?.toLowerCase().includes('forbidden') ||
      error.message?.toLowerCase().includes('berechtigung');

    setIsPermissionError(is403);
  }, [error]);

  if (!isPermissionError) {
    return null;
  }

  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-semibold text-red-600">
          Keine Berechtigung
        </h3>
        <p className="mt-1 text-sm text-red-500">
          {message || 'Sie haben keine Berechtigung, diese Daten anzuzeigen.'}
        </p>
      </div>
    </div>
  );
}

/**
 * Inline version for compact display in tables
 */
export function InlinePermissionError({ message }: { message?: string }) {
  return (
    <div className="flex items-center gap-2 py-4 px-2 text-red-600">
      <svg
        className="h-5 w-5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <span className="text-sm font-medium">
        {message || 'Keine Berechtigung für diese Daten'}
      </span>
    </div>
  );
}
