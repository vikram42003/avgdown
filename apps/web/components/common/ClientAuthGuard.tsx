"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Skeleton } from "@/components/ui/skeleton";

export function ClientAuthGuard({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, isLoading, error } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If the token is invalid (401), clear the dead httpOnly cookie and redirect
    if (!isLoading && error?.status === 401) {
      const clearCookieAndRedirect = async () => {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/auth/logout`, {
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

  // While checking auth state, show a generic dashboard skeleton
  // so we don't flash unauthenticated content or crash child components
  if (isLoading || (!user && !error)) {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
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
