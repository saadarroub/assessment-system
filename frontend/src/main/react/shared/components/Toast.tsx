import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

export interface ToastProps {
  message: string;
  type?: 'warning' | 'error' | 'success' | 'info';
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'warning', duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const enter = setTimeout(() => setIsVisible(true), 10);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 220); // match transition duration
    }, duration);

    return () => {
      clearTimeout(enter);
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  const theme = useMemo(() => {
   
    switch (type) {
      case 'success':
        return {
          accent: 'bg-emerald-500/90',
          icon: 'text-emerald-600',
          ring: 'ring-emerald-500/15',
          bar: 'bg-emerald-500/70',
          title: 'Erfolg',
        };
      case 'info':
        return {
          accent: 'bg-sky-500/90',
          icon: 'text-sky-600',
          ring: 'ring-sky-500/15',
          bar: 'bg-sky-500/70',
          title: 'Info',
        };
      case 'error':
        // weniger aggressiv als bg-red-500 full
        return {
          accent: 'bg-rose-500/90',
          icon: 'text-rose-600',
          ring: 'ring-rose-500/15',
          bar: 'bg-rose-500/70',
          title: 'Fehler',
        };
      case 'warning':
      default:
        return {
          accent: 'bg-amber-500/90',
          icon: 'text-amber-600',
          ring: 'ring-amber-500/15',
          bar: 'bg-amber-500/70',
          title: 'Hinweis',
        };
    }
  }, [type]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 220);
  };

  const toast = (
    <div
      className={[
        'fixed top-4 left-1/2 -translate-x-1/2 z-[9999]',
        'transition-all duration-200 ease-out',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3',
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      <div
        className={[
          // Card Look 
          'relative overflow-hidden',
          'min-w-[320px] max-w-[680px]',
          'rounded-xl border border-white/10',
          'bg-white/95 text-slate-900',
          'shadow-[0_18px_50px_-24px_rgba(0,0,0,0.55)]',
          'backdrop-blur',
          'ring-1',
          theme.ring,
        ].join(' ')}
      >
        {/* Left accent */}
        <div className={['absolute left-0 top-0 h-full w-1.5', theme.accent].join(' ')} />

        <div className="flex items-start gap-3 px-4 py-3 pl-5">
          {/* Icon bubble */}
          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/5">
            <svg className={['h-5 w-5', theme.icon].join(' ')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {type === 'warning' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              )}
              {type === 'error' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
              {type === 'success' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
              {type === 'info' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
          </div>

          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-900">{theme.title}</div>
            <div className="mt-0.5 text-sm leading-5 text-slate-700">{message}</div>
          </div>

          <button
            onClick={handleClose}
            className="ml-2 rounded-lg p-1.5 text-slate-500 hover:bg-slate-900/5 hover:text-slate-700"
            aria-label="Toast schließen"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progressbar (bottom) */}
        <div className="h-1 w-full bg-slate-900/5">
          <div
            className={['h-full', theme.bar].join(' ')}
            style={{
              // Trick: Wir animieren width von 100% -> 0
              width: isVisible ? '0%' : '100%',
              transitionProperty: 'width',
              transitionDuration: `${duration}ms`,
              transitionTimingFunction: 'linear',
            }}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(toast, document.body);
}
