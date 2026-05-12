"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChartLineUpIcon } from "@phosphor-icons/react";
import { setPendingToast } from "@/components/common/PendingToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleIcon } from "@/components/icons/GoogleIcon";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.message ?? "Something went wrong. Please try again.");
        return;
      }

      setPendingToast("success", "Account created — welcome to AvgDown!");
      router.push("/dashboard");
    } catch {
      setError("Could not connect to the server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 min-h-screen items-center justify-center bg-background px-4">
      <div className="glass w-full max-w-md rounded-2xl p-8 space-y-6">
        {/* Brand mark */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/20 text-chart-1">
            <ChartLineUpIcon weight="bold" size={22} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">Start tracking your DCA targets</p>
        </div>

        {/* Google OAuth */}
        <Button asChild variant="outline" className="w-full" size="lg">
          <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/oauth/google`}>
            <GoogleIcon />
            Continue with Google
          </a>
        </Button>

        <div className="relative flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex-1 border-t border-border" />
          <span>or</span>
          <div className="flex-1 border-t border-border" />
        </div>

        {/* Registration form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm" className="text-sm font-medium">
              Confirm password
            </label>
            <Input
              id="confirm"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
