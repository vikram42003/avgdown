"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrashIcon, WarningIcon, ArrowLeftIcon } from "@phosphor-icons/react";
import { useDeleteAccount } from "@/hooks/useDeleteAccount";

export function DangerZone() {
  const {
    user,
    deleteStep,
    setDeleteStep,
    confirmEmail,
    setConfirmEmail,
    isDeleting,
    confirmDelete,
  } = useDeleteAccount();

  return (
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
                onClick={confirmDelete}
                className="gap-2 bg-destructive hover:bg-destructive/90 text-white"
              >
                {isDeleting ? "Deleting..." : "Permanently Delete My Account"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
