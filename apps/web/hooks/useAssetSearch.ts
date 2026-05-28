import useSWR from "swr";
import type { AssetSearchResult } from "@avgdown/types";

export function useAssetSearch(query: string) {
  // Only fetch when query has at least 1 character
  const key = query.trim().length > 0 ? `/assets/search?q=${encodeURIComponent(query.trim())}` : null;

  const { data, error, isLoading } = useSWR<AssetSearchResult[]>(key, {
    keepPreviousData: true,
    dedupingInterval: 2000,
  });

  return {
    results: data ?? [],
    isLoading,
    error,
  };
}
