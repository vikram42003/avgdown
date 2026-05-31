import * as React from "react";
import { Button } from "./button";
import { SpinnerGapIcon } from "@phosphor-icons/react";

interface SpinnerButtonProps extends React.ComponentProps<typeof Button> {
  isLoading?: boolean;
  loadingText?: React.ReactNode;
}

export function SpinnerButton({
  children,
  isLoading,
  loadingText,
  disabled,
  ...props
}: Readonly<SpinnerButtonProps>) {
  return (
    <Button disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <span className="flex items-center gap-2">
          <SpinnerGapIcon className="size-4 animate-spin" />
          {loadingText ?? "Loading..."}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
