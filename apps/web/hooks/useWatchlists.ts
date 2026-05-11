import useSWR from "swr";
import type { WatchlistEntryResponse, RecentAlertResponse, PriceSnapshotChartDataResponse } from "@avgdown/types";

// --- Watchlists ---

export function useWatchlists() {
  const { data, error, isLoading, mutate } = useSWR<WatchlistEntryResponse[]>("/watchlists");
  return {
    watchlists: data ?? [],
    isLoading,
    error,
    mutate,
  };
}

// --- Recent Alerts ---

export function useRecentAlerts() {
  const { data, error, isLoading } = useSWR<RecentAlertResponse[]>("/watchlists/recent-alerts");
  return {
    alerts: data ?? [],
    isLoading,
    error,
  };
}

// --- Chart data for a single watchlist entry ---
// Pass null to skip the fetch (e.g. when no entry is selected yet)

export function useChartData(entryId: string | null) {
  const { data, error, isLoading } = useSWR<PriceSnapshotChartDataResponse>(
    entryId ? `/watchlists/${encodeURIComponent(entryId)}/chart-data` : null,
  );
  return {
    chartData: data ?? null,
    isLoading,
    error,
  };
}
