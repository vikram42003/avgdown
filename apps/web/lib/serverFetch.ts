import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";

/**
 * Server-side fetch utility for Next.js Server Components.
 * Forwards the auth cookie from the incoming request and redirects to /login on 401.
 * Always bypasses cache (financial data must be fresh).
 */

export async function serverFetch<T>(path: string): Promise<T> {
  const cookieStore = await cookies();
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Cookie: cookieStore.toString() },
    cache: "no-store",
  });

  if (res.status === 401) redirect("/login");
  if (!res.ok) throw new Error(`serverFetch ${path} failed with status ${res.status}`);

  return res.json() as Promise<T>;
}
