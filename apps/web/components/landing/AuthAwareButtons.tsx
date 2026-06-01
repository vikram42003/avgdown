"use client";

import Link from "next/link";
import { ArrowRightIcon, GaugeIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";

/**
 * Renders different CTAs depending on auth state:
 * - Logged in  -> "Go to Dashboard"
 * - Logged out -> the normal "Start for free" / "Sign in" pair
 *
 * Trade-off: While the isLoading flag is true, HeroCtas returns null to prevent
 * unauthenticated buttons from flickering for authenticated users. This avoids
 * rendering the incorrect call-to-actions initially, but can result in a minor
 * layout shift in HeroSection once the auth state resolves.
 */
export function HeroCtas() {
  const { isLoggedIn, isLoading } = useUser();

  if (isLoading) return null;

  if (isLoggedIn) {
    return (
      <Button size="lg" asChild className="rounded-full px-8 text-base gap-2">
        <Link href="/dashboard">
          <GaugeIcon weight="bold" className="size-4" />
          Go to Dashboard
        </Link>
      </Button>
    );
  }

  return (
    <>
      <Button size="lg" asChild className="rounded-full px-8 text-base gap-2">
        <Link href="/signup">
          Start for free
          <ArrowRightIcon weight="bold" className="size-4" />
        </Link>
      </Button>
      <Button size="lg" variant="outline" asChild className="rounded-full px-8 text-base">
        <Link href="/login">Sign in</Link>
      </Button>
    </>
  );
}

/**
 * Compact variant for the nav bar.
 * Shows Sign In / Get Started by default (including during auth check),
 * and switches to Dashboard only once login is confirmed.
 */
export function NavAuthButtons() {
  const { isLoggedIn, isLoading } = useUser();

  // While loading, show the logged-out variant so the navbar is never empty.
  // It'll flip to Dashboard silently once /me resolves.
  if (!isLoading && isLoggedIn) {
    return (
      <Button size="sm" asChild className="rounded-full px-5">
        <Link href="/dashboard">Dashboard</Link>
      </Button>
    );
  }

  return (
    <>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/login">Sign In</Link>
      </Button>
      <Button size="sm" asChild className="rounded-full px-5">
        <Link href="/signup">Get Started</Link>
      </Button>
    </>
  );
}

/**
 * CTA section variant — shows "Go to Dashboard" instead of "Create account" when logged in.
 */
export function CtaButton() {
  const { isLoggedIn, isLoading } = useUser();

  if (isLoading) return null;

  if (isLoggedIn) {
    return (
      <Button size="lg" asChild className="relative rounded-full px-10 text-base gap-2">
        <Link href="/dashboard">
          <GaugeIcon weight="bold" className="size-4" />
          Go to Dashboard
        </Link>
      </Button>
    );
  }

  return (
    <Button size="lg" asChild className="relative rounded-full px-10 text-base gap-2">
      <Link href="/signup">
        Create a free account
        <ArrowRightIcon weight="bold" className="size-4" />
      </Link>
    </Button>
  );
}
