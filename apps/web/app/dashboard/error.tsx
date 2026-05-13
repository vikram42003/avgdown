"use client";

import { useEffect } from "react";
import { WarningCircleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error("Dashboard Error:", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center glass rounded-xl m-4">
      <WarningCircleIcon className="size-12 text-destructive mb-3" />
      <h2 className="text-xl font-bold mb-2">Failed to load dashboard data</h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        We ran into an issue while loading your data. This might be a temporary network hiccup.
      </p>
      <Button onClick={() => reset()} variant="secondary">
        Try Again
      </Button>
    </div>
  );
}
