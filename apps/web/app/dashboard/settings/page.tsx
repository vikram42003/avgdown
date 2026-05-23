"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageTitle } from "@/components/common/PageTitle";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/hooks/useUser";
import { apiMutate, apiMutateVoid } from "@/lib/api";
import { GlobeIcon, TrashIcon, UserIcon, WarningIcon, CheckIcon, KeyIcon, ArrowLeftIcon } from "@phosphor-icons/react";

export default function SettingsPage() {
  const { user, mutate } = useUser();
  const router = useRouter();

  // Webhook settings state
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [webhookError, setWebhookError] = useState<string | null>(null);

  // Account deletion state
  // 0 = Idle, 1 = Show validation form, 2 = Secondary confirmation dialog
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync webhook URL when user loads
  useEffect(() => {
    if (user?.webhookUrl) {
      setWebhookUrl(user.webhookUrl);
    } else {
      setWebhookUrl("");
    }
  }, [user]);

  function handleWebhookSave(e: React.FormEvent) {
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
      apiMutate("/users/me", "PATCH", { webhookUrl: finalUrl })
        .then((updatedUser) => {
          mutate(updatedUser as any);
        })
        .finally(() => setIsSaving(false)),
      {
        loading: "Saving webhook settings...",
        success: "Webhook settings saved successfully",
        error: "Failed to save webhook settings",
      }
    );
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    try {
      await apiMutateVoid("/users/me", "DELETE");
      // Clear cache and redirect to login
      await mutate(undefined, { revalidate: false });
      toast.success("Your account has been permanently deleted.");
      router.push("/login");
    } catch (err) {
      console.error("Account deletion failed:", err);
      toast.error("Failed to delete account. Please try again.");
      setIsDeleting(false);
      setDeleteStep(0);
      setConfirmEmail("");
    }
  }

  // Format creation timestamp
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <section className="flex flex-1 flex-col max-w-4xl w-full mx-auto">
      <div className="flex shrink-0 items-center justify-between mb-8">
        <PageTitle title="Account Settings" />
      </div>

      <div className="flex flex-col gap-8">
        {/* Profile Card */}
        <Card className="glass-primary rounded-xl overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <UserIcon size={20} weight="bold" />
              </div>
              <div>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>Your basic account identity information.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</span>
                <span className="text-base font-medium bg-input/20 px-3 py-2 rounded-lg border border-border/30 text-foreground/80 max-w-md truncate">
                  {user?.email}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Member Since</span>
                <span className="text-base font-medium bg-input/20 px-3 py-2 rounded-lg border border-border/30 text-foreground/80 max-w-md">
                  {joinedDate}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 bg-primary/5 p-3 rounded-lg border border-primary/10 max-w-lg">
              <KeyIcon size={14} weight="bold" className="text-primary shrink-0" />
              <span>
                To modify your authentication credentials or email, please contact support.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Webhooks Card */}
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
            <form onSubmit={handleWebhookSave} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="webhook-url">Custom Webhook URL</Label>
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
                  Whenever price conditions cross your specified simple moving average (SMA) watchlist thresholds, we will make a HTTP POST request to this URL with alert details. Leave empty to disable.
                </p>
              </div>

              {webhookError && (
                <p className="text-sm text-destructive font-medium flex items-center gap-1.5" role="alert">
                  <WarningIcon size={16} weight="bold" />
                  {webhookError}
                </p>
              )}

              <div>
                <Button type="submit" disabled={isSaving} className="gap-2 transition-transform active:scale-98">
                  {isSaving ? "Saving..." : "Save Webhook Settings"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Danger Zone Card */}
        <Card className="border-destructive/30 bg-destructive/5 rounded-xl overflow-hidden">
          <CardHeader className="border-b border-destructive/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                <TrashIcon size={20} weight="bold" />
              </div>
              <div>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription className="text-destructive/80">Irreversible actions regarding your account.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {deleteStep === 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1 max-w-xl">
                  <h4 className="text-sm font-semibold">Delete Account</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Permanently delete your profile, custom alerts, watchlist settings, and all historical data. This operation is absolute and cannot be undone under any circumstances.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteStep(1)}
                  className="sm:self-center transition-transform active:scale-98"
                >
                  Delete Account
                </Button>
              </div>
            )}

            {deleteStep === 1 && (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200 max-w-xl">
                <div className="flex items-start gap-2 bg-destructive/10 p-3 rounded-lg border border-destructive/20 text-destructive text-sm">
                  <WarningIcon size={18} weight="bold" className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Please read carefully before proceeding:</span>
                    <span>
                      Deleting your account will immediately wipe out all active watchlist monitors, trigger thresholds, and delivery histories. You will be signed out instantly and lose access.
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="delete-confirm" className="text-sm font-semibold">
                    Type your email <span className="font-mono text-primary select-all">{user?.email}</span> to confirm:
                  </Label>
                  <Input
                    id="delete-confirm"
                    type="text"
                    placeholder="Enter your email to verify"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    className="bg-input/20 border-destructive/30 max-w-md focus-visible:ring-destructive/30 focus-visible:border-destructive/40"
                    autoComplete="off"
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDeleteStep(0);
                      setConfirmEmail("");
                    }}
                    className="gap-1.5"
                  >
                    <ArrowLeftIcon size={14} />
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={confirmEmail !== user?.email}
                    onClick={() => setDeleteStep(2)}
                  >
                    Yes, continue to confirmation
                  </Button>
                </div>
              </div>
            )}

            {deleteStep === 2 && (
              <div className="flex flex-col gap-4 animate-in zoom-in-95 duration-150 max-w-xl">
                <div className="flex items-start gap-2 bg-destructive/25 p-4 rounded-lg border border-destructive/40 text-destructive text-sm">
                  <WarningIcon size={20} weight="bold" className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-1">Final Double-Check Warning</span>
                    <span>
                      Are you absolutely 100% sure? There is no backup, and our support team cannot restore your watchlists or settings if you click confirm.
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDeleteStep(1);
                    }}
                    disabled={isDeleting}
                    className="gap-1.5"
                  >
                    <ArrowLeftIcon size={14} />
                    Go Back
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isDeleting}
                    onClick={handleConfirmDelete}
                    className="gap-2 bg-destructive hover:bg-destructive/90 text-white"
                  >
                    {isDeleting ? "Deleting..." : "Permanently Delete My Account"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
