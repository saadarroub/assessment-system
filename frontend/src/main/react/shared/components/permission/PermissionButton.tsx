import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  allowed: boolean;
  tooltip?: string;
  children: ReactNode;
};

export function PermissionButton({ allowed, tooltip, disabled, onClick, children, ...rest }: Props) {
  const isDisabled = disabled || !allowed;

  return (
    <button
      {...rest}
      disabled={isDisabled}
      onClick={(e) => {
        if (isDisabled) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        onClick?.(e);
      }}
      title={!allowed ? (tooltip ?? "Du hast keine Berechtigung für diese Aktion.") : rest.title}
      aria-disabled={!allowed}
      className={[
        rest.className ?? "",
        !allowed ? "opacity-50 cursor-not-allowed" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
