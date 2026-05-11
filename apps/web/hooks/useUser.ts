import useSWR from "swr";
import type { UserResponse } from "@avgdown/types";
import { fetcher } from "@/lib/api";

// Fetches the currently authenticated user from GET /users/me.
export function useUser() {
  const { data, error, isLoading, mutate } = useSWR<UserResponse>("/users/me", fetcher, {
    // Don't retry on 401 - the user is simply not logged in
    shouldRetryOnError: false,
  });

  return {
    user: data,
    isLoading,
    isLoggedIn: !!data && !error, // Evaluates to true only if data is true and error is false
    error,
    mutate,
  };
}
