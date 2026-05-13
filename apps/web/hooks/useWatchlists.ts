import useSWR from "swr";
import type { WatchlistEntryResponse, RecentAlertResponse, PriceSnapshotChartDataResponse } from "@avgdown/types";

// Watchlists
// fallbackData is the server-fetched snapshot, SWR revalidates in the background.

export function useWatchlists(fallbackData?: WatchlistEntryResponse[]) {
  const { data, error, isLoading, mutate } = useSWR<WatchlistEntryResponse[]>("/watchlists", { fallbackData });
  return {
    watchlists: data ?? [],
    isLoading,
    error,
    mutate,
  };
}

// Recent Alerts

export function useRecentAlerts(fallbackData?: RecentAlertResponse[]) {
  const { data, error, isLoading } = useSWR<RecentAlertResponse[]>("/watchlists/recent-alerts", { fallbackData });
  return {
    alerts: data ?? [],
    isLoading,
    error,
  };
}

// Chart data for a single watchlist entry
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
