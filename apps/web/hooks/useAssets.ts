import useSWR from "swr";
import type { AssetResponse } from "@avgdown/types";

export function useAssets() {
  const { data, error, isLoading } = useSWR<AssetResponse[]>("/assets");

  return {
    assets: data ?? [],
    isLoading,
    error,
  };
}
