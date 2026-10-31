"use client";

import React, { useEffect } from "react";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Suppress known benign browser extension messaging port and push service errors
    const isIgnorableError = (msg: string) => {
      return (
        typeof msg === "string" &&
        (msg.includes("A listener indicated an asynchronous response") ||
          msg.includes("message channel closed before a response was received") ||
          msg.includes("Registration failed - push service error") ||
          msg.includes("push service error"))
      );
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const msg = event?.reason?.message || String(event?.reason || "");
      if (isIgnorableError(msg)) {
        event.preventDefault();
      }
    };

    const handleError = (event: ErrorEvent) => {
      const msg = event?.message || String(event?.error || "");
      if (isIgnorableError(msg)) {
        event.preventDefault();
      }
    };

    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const fullMsg = args
        .map((arg) => (typeof arg === "string" ? arg : arg?.message || ""))
        .join(" ");
      if (isIgnorableError(fullMsg)) {
        return;
      }
      originalConsoleError.apply(console, args);
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleError);
      console.error = originalConsoleError;
    };
  }, []);

  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
