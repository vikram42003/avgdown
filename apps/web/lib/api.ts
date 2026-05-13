export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "production"
    ? (() => {
        throw new Error("NEXT_PUBLIC_API_URL is not set");
      })()
    : "http://localhost:3001");

// Base fetcher for SWR. Prepends the API base URL and sends cookies
// Throws on non-2xx responses so SWR surfaces them as `error`.
export async function fetcher<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const error = new Error("API request failed");
    (error as Error & { status: number }).status = res.status;
    throw error;
  }

  return res.json() as Promise<T>;
}

/**
 * Mutation helper for POST/PATCH/DELETE requests that return a JSON response body.
 * Throws on non-2xx responses. Use `apiMutateVoid` for 204 No Content responses.
 */
export async function apiMutate<T>(path: string, method: "POST" | "PATCH" | "DELETE", body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) {
    const error = new Error("API request failed");
    (error as Error & { status: number }).status = res.status;
    throw error;
  }

  return res.json() as Promise<T>;
}

/**
 * Mutation helper for POST/PATCH/DELETE requests that return 204 No Content.
 * Throws on non-2xx responses.
 */
export async function apiMutateVoid(path: string, method: "POST" | "PATCH" | "DELETE", body?: unknown): Promise<void> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) {
    const error = new Error("API request failed");
    (error as Error & { status: number }).status = res.status;
    throw error;
  }
}
