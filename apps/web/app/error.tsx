"use client";

import { useEffect } from "react";
import { WarningCircleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    // Optionally log to error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 min-h-screen flex-col items-center justify-center p-4 text-center">
      <WarningCircleIcon className="size-16 text-destructive mb-4" />
      <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
      <p className="text-muted-foreground max-w-md mb-6">
        An unexpected error occurred. If this problem persists, please contact support.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => globalThis.location.reload()} variant="outline">
          Reload Page
        </Button>
        <Button onClick={() => reset()}>Try Again</Button>
      </div>
    </div>
  );
}
