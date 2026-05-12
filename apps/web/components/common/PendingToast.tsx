"use client";

import { useEffect } from "react";
import { toast } from "sonner";

type ToastType = "success" | "error" | "info";

interface PendingToast {
  type: ToastType;
  message: string;
}

/** Write a toast to sessionStorage to be shown on the next page load. */
export function setPendingToast(type: ToastType, message: string) {
  sessionStorage.setItem("pendingToast", JSON.stringify({ type, message }));
}

/**
 * Mount this component wherever you want pending toasts to fire.
 * Reads + clears sessionStorage on mount so the toast only shows once.
 */
export function PendingToast() {
  useEffect(() => {
    const raw = sessionStorage.getItem("pendingToast");
    if (!raw) return;
    sessionStorage.removeItem("pendingToast");
    try {
      const { type, message } = JSON.parse(raw) as PendingToast;
      toast[type]?.(message);
    } catch {
      // malformed item — ignore
    }
  }, []);

  return null;
}
