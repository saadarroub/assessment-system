import { ShieldAlert } from 'lucide-react';

export interface PermissionBlurOverlayProps {
  message?: string;
  show: boolean;
}

/**
 * Blur Overlay für fehlende Berechtigungen bei GET-Requests
 * Erscheint ÜBER der Komponente (nicht fullscreen)
 * Verwende relative positioning im Parent!
 */
export function PermissionBlurOverlay({ 
  message = 'Sie haben keine Berechtigung, diese Daten anzuzeigen.',
  show 
}: PermissionBlurOverlayProps) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      {/* Blur Background über Komponente */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-md rounded-lg" />
      
      {/* Error Content */}
      <div className="relative z-10 mx-4 max-w-sm rounded-xl bg-white p-6 shadow-xl border border-yellow-200">
        {/* Icon */}
        <div className="mb-3 flex justify-center">
          <div className="rounded-full bg-yellow-100 p-3">
            <ShieldAlert className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        {/* Title */}
        <h3 className="mb-2 text-center text-lg font-semibold text-gray-800">
          Keine Berechtigung
        </h3>
        
        {/* Message */}
        <p className="mb-4 text-center text-sm text-gray-600">
          {message}
        </p>
        
        {/* Info Box */}
        <div className="rounded-lg bg-yellow-50 px-3 py-2 text-center">
          <p className="text-xs text-yellow-800">
            Kontaktieren Sie Ihren Administrator
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline Permission Error (ohne Blur) für kompakte Darstellung
 */
export function InlinePermissionError({ 
  message = 'Keine Berechtigung für diese Daten' 
}: { message?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-8">
      <ShieldAlert className="h-6 w-6 text-yellow-600" />
      <span className="text-sm font-medium text-yellow-800">{message}</span>
    </div>
  );
}
