// src/main/react/shared/hooks/useScrollLock.ts
import { useEffect } from "react";

export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById("root");

    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    const prevRoot = root?.style.overflow;

    if (locked) {
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
      if (root) root.style.overflow = "hidden";
    } else {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      if (root) root.style.overflow = prevRoot || "";
    }

    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      if (root) root.style.overflow = prevRoot || "";
    };
  }, [locked]);
}
