import useSWR from "swr";
import type { AssetResponse } from "@avgdown/types";

export function useAssets(fallbackData?: AssetResponse[]) {
  const { data, error, isLoading } = useSWR<AssetResponse[]>("/assets", { fallbackData });
  return {
    assets: data ?? [],
    isLoading,
    error,
  };
}
