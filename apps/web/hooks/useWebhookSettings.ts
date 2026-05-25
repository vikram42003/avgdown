import { useState, SyntheticEvent } from "react";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";
import { apiMutate } from "@/lib/api";
import type { UserResponse } from "@avgdown/types";

export function useWebhookSettings(initialUrl: string) {
  const { mutate } = useUser();
  const [webhookUrl, setWebhookUrl] = useState(initialUrl);

  const [isSaving, setIsSaving] = useState(false);
  const [webhookError, setWebhookError] = useState<string | null>(null);

  const saveWebhook = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setWebhookError(null);

    const trimmedUrl = webhookUrl.trim();
    let finalUrl: string | null = null;

    if (trimmedUrl !== "") {
      try {
        const parsed = new URL(trimmedUrl);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          setWebhookError("URL must start with http:// or https://");
          return;
        }
        finalUrl = trimmedUrl;
      } catch {
        setWebhookError("Please enter a valid URL (e.g. https://discord.com/api/webhooks/...)");
        return;
      }
    }

    setIsSaving(true);
    toast.promise(
      apiMutate<UserResponse>("/users/me", "PATCH", { webhookUrl: finalUrl })
        .then((updatedUser) => {
          mutate(updatedUser);
        })
        .finally(() => setIsSaving(false)),
      {
        loading: "Saving webhook settings...",
        success: "Webhook settings saved successfully",
        error: "Failed to save webhook settings",
      }
    );
  };

  return {
    webhookUrl,
    setWebhookUrl,
    isSaving,
    webhookError,
    setWebhookError,
    saveWebhook,
  };
}
