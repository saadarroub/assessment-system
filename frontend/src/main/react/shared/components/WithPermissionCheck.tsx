import type { ReactNode, ComponentType } from 'react';
import { useComponentPermissionError } from '@/shared/hooks/useComponentPermissionError';
import { PermissionBlurOverlay } from './PermissionBlurOverlay';

interface WithPermissionCheckProps {
  error?: Error | null;
  loading?: boolean;
  children: ReactNode;
  minHeight?: string;
  customMessage?: string;
}

/**
 * HOC Wrapper für automatische Permission-Error-Anzeige
 * Zeigt Blur-Overlay bei 403-Errors automatisch
 */
export function WithPermissionCheck({ 
  error, 
  loading, 
  children, 
  minHeight = '400px',
  customMessage 
}: WithPermissionCheckProps) {
  const { hasPermissionError, errorMessage } = useComponentPermissionError(error);

  return (
    <div className="relative" style={{ minHeight }}>
      <PermissionBlurOverlay 
        show={hasPermissionError && !loading}
        message={customMessage || errorMessage || undefined}
      />
      {children}
    </div>
  );
}

/**
 * HOC für Component-Level Permission-Check
 * Wraps eine ganze Komponente
 */
export function withPermissionCheck<P extends object>(
  Component: ComponentType<P>,
  options?: {
    minHeight?: string;
    customMessage?: string;
  }
) {
  return function WrappedComponent(props: P & { error?: Error | null; loading?: boolean }) {
    const { error, loading, ...restProps } = props;
    
    return (
      <WithPermissionCheck 
        error={error}
        loading={loading}
        minHeight={options?.minHeight}
        customMessage={options?.customMessage}
      >
        <Component {...(restProps as P)} />
      </WithPermissionCheck>
    );
  };
}
