"use client";

import { ToastProvider, AnchoredToastProvider } from "@/components/ui/toast";

export function ToastProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AnchoredToastProvider>
        {children}
      </AnchoredToastProvider>
    </ToastProvider>
  );
}

