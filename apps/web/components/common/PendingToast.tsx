"use client";

import { useEffect } from "react";
import { toast } from "sonner";

type ToastType = "success" | "error" | "info";

interface PendingToast {
  type: ToastType;
  message: string;
}

// Write a toast to sessionStorage to be shown on the next page load
export function setPendingToast(type: ToastType, message: string) {
  sessionStorage.setItem("pendingToast", JSON.stringify({ type, message }));
}

/**
 * This toast is for operations that navigate away from the main page, like showing "Welcome back" after
 * signing in again needs us to kinda store somewhere that the user is logging in again, and it needs to
 * be cleared up appropriately
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
      // ignore malformed item
    }
  }, []);

  return null;
}
