"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlobeIcon, WarningIcon } from "@phosphor-icons/react";
import { useWebhookSettings } from "@/hooks/useWebhookSettings";
import { useUser } from "@/hooks/useUser";
import { Skeleton } from "@/components/ui/skeleton";
import WebhookPayloadInfoSheet from "./WebhookPayloadInfoSheet";

function WebhookSettingsSkeleton() {
  return (
    <Card className="glass-primary rounded-xl overflow-hidden">
      <CardHeader className="border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <GlobeIcon size={20} weight="bold" />
          </div>
          <div>
            <CardTitle>Integrations & Webhooks</CardTitle>
            <CardDescription>Receive alert notifications outside of email.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-full max-w-2xl" />
            <Skeleton className="h-4 w-full max-w-xl" />
          </div>
          <Skeleton className="h-10 w-44" />
        </div>
      </CardContent>
    </Card>
  );
}

interface WebhookSettingsFormProps {
  readonly initialUrl: string;
}

function WebhookSettingsForm({ initialUrl }: WebhookSettingsFormProps) {
  const {
    webhookUrl,
    setWebhookUrl,
    isSaving,
    webhookError,
    setWebhookError,
    saveWebhook,
  } = useWebhookSettings(initialUrl);

  return (
    <Card className="glass-primary rounded-xl overflow-hidden">
      <CardHeader className="border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <GlobeIcon size={20} weight="bold" />
          </div>
          <div>
            <CardTitle>Integrations & Webhooks</CardTitle>
            <CardDescription>Receive alert notifications outside of email.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={saveWebhook} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="webhook-url">Custom Webhook URL</Label>
            </div>
            <Input
              id="webhook-url"
              placeholder="https://discord.com/api/webhooks/... or https://your-server.com/endpoint"
              value={webhookUrl}
              onChange={(e) => {
                setWebhookUrl(e.target.value);
                if (webhookError) setWebhookError(null);
              }}
              className="bg-input/20 border-border/40 max-w-2xl"
              disabled={isSaving}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground max-w-2xl mt-1">
              Whenever price conditions cross your specified simple moving average (SMA) watchlist thresholds, we will
              make a HTTP POST request to this URL with alert details. Leave empty to disable.
            </p>
          </div>

          {webhookError && (
            <p className="text-sm text-destructive font-medium flex items-center gap-1.5" role="alert">
              <WarningIcon size={16} weight="bold" />
              {webhookError}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Button type="submit" disabled={isSaving} className="gap-2 transition-transform active:scale-98">
              {isSaving ? "Saving..." : "Save Webhook Settings"}
            </Button>

            <WebhookPayloadInfoSheet />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function WebhookSettings() {
  const { user } = useUser();

  if (!user) {
    return <WebhookSettingsSkeleton />;
  }

  return <WebhookSettingsForm key={user.webhookUrl ?? ""} initialUrl={user.webhookUrl ?? ""} />;
}
