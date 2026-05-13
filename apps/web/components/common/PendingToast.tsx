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
  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem("pendingToast", JSON.stringify({ type, message }));
    }
  } catch (error) {
    console.warn("Failed to set pending toast:", error);
  }
}

/**
 * This toast is for operations that navigate away from the main page, like showing "Welcome back" after
 * signing in again needs us to kinda store somewhere that the user is logging in again, and it needs to
 * be cleared up appropriately
 */
export function PendingToast() {
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("pendingToast");
      if (!raw) return;
      
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.message === "string" && typeof parsed.type === "string" && typeof toast[parsed.type as ToastType] === "function") {
        toast[parsed.type as ToastType](parsed.message);
      }
      
      sessionStorage.removeItem("pendingToast");
    } catch (error) {
      console.warn("Failed to process pending toast:", error);
      sessionStorage.removeItem("pendingToast");
    }
  }, []);

  return null;
}
