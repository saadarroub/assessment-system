import type { ReactNode } from "react";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export type ConfirmModalProps = {
  open: boolean;

  title: ReactNode;
  description: ReactNode;

  hintTitle?: ReactNode;
  hintText?: ReactNode;

  confirmLabel: ReactNode;
  cancelLabel: ReactNode;

  onConfirm: () => void;
  onCancel: () => void;

  icon?: ReactNode;

  /** Optional: falls du mal per Klick auf den Hintergrund schließen willst */
  closeOnBackdropClick?: boolean;
};

export default function ConfirmModal(props: ConfirmModalProps) {
  const {
    open,
    title,
    description,
    hintTitle,
    hintText,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
    icon,
    closeOnBackdropClick = false,
  } = props;

  // === Body-Scroll sperren, solange das Modal offen ist ===
  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      onCancel();
    }
  };

  return (
    <div
      className="
        fixed inset-0
        z-[1000]                     /* sehr hoch, blockiert alles */
        flex items-center justify-center
        bg-black/40 backdrop-blur-sm /* Blur + dunkler Overlay */
      "
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-xl px-4 sm:px-0"
        onClick={(e) => e.stopPropagation()} // Klicks in der Karte NICHT zum Overlay durchlassen
      >
        {/* Oberer Content-Block */}
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200/80">
          {/* Deko-Glows */}
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-gradient-to-br from-[#E3BB62]/40 via-amber-400/20 to-transparent opacity-60"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -left-24 -bottom-24 h-52 w-52 rounded-full bg-gradient-to-tr from-sky-500/20 via-indigo-500/10 to-transparent opacity-60"
            aria-hidden="true"
          />

          {/* Inhalt */}
          <div className="relative px-6 pt-6 pb-5">
            <div className="flex items-start gap-4">
              {/* Icon-Badge */}
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200 shadow-sm">
                {icon ?? <AlertTriangle className="text-amber-500" />}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                    {title}
                  </h2>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            {/* Hinweis-Box */}
            {hintText && (
              <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                {hintTitle && (
                  <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase mb-1">
                    {hintTitle}
                  </p>
                )}
                <p className="text-sm text-slate-600">
                  {hintText}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Abstand */}
        <div className="h-3" />

        {/* Button-Leiste */}
        <div className="mt-1 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="
              flex-1
              h-12
              text-sm font-medium
              text-slate-800
              bg-[#f3f3f3]
              hover:bg-[#e5e5e5]
              border border-slate-200
              rounded-xl
            "
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="
              flex-1
              h-12
              text-sm font-semibold
              rounded-xl
              bg-[#E3BB62]
              text-[#264555]
              hover:bg-[#d8ac55]
              shadow-[0_10px_30px_rgba(0,0,0,0.18)]
              transition
              hover:-translate-y-[1px]
            "
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
