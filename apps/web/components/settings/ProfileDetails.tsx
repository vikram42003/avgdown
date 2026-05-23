"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useUser } from "@/hooks/useUser";
import { UserIcon, KeyIcon } from "@phosphor-icons/react";

export function ProfileDetails() {
  const { user } = useUser();

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
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
  );
}
