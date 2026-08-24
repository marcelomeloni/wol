"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#303039",
          color: "#ffffff",
          border: "1px solid rgba(255,255,255,0.1)",
        },
        success: {
          iconTheme: {
            primary: "#ffe2e5",
            secondary: "#303039",
          },
        },
      }}
    />
  );
}
