import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/styles/index.css";
import AppShell from "@/apps/app/AppShell";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <>
      <AppShell />
      <Toaster position="top-right" />
    </>
  </StrictMode>
);
