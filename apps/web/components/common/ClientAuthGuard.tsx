"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { API_URL } from "@/lib/api";

export function ClientAuthGuard({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, isLoading, error } = useUser();
  const router = useRouter();
  const redirectingRef = useRef(false);

  useEffect(() => {
    // If the token is invalid (401), clear the dead httpOnly cookie and redirect
    if (!isLoading && error?.status === 401) {
      if (redirectingRef.current) return;
      redirectingRef.current = true;
      const clearCookieAndRedirect = async () => {
        try {
          await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
          });
        } catch {
          // ignore error since we just want to redirect regardless
        } finally {
          router.push("/login");
        }
      };
      clearCookieAndRedirect();
    }
  }, [isLoading, error, router]);

  if (isLoading || (!user && !error)) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="size-6 rounded-full border-2 border-muted border-t-primary animate-spin" />
      </div>
    );
  }

  // If there's an error but we are handling it in useEffect, we can just return null 
  // briefly to prevent rendering the protected content.
  if (error) {
    return null;
  }

  return <>{children}</>;
}
