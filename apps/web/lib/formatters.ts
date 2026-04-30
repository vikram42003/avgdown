import { Exchange } from "@avgdown/types";

export function getCurrencySymbol(exchange: Exchange): string {
  switch (exchange) {
    case "NSE":
    case "BSE":
      return "₹";
    case "NASDAQ":
    case "NYSE":
    case "COINBASE":
    case "BINANCE":
    default:
      return "$";
  }
}

export function formatCurrency(value: number, exchange: Exchange): string {
  const symbol = getCurrencySymbol(exchange);
  // Optional: add locale-aware number formatting later on
  return `${symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const formatRelativeTime = (date: Date | string | number): string => {
  const now = Date.now();
  const created = new Date(date).getTime();
  const diffInMs = now - created;

  // Define constants in milliseconds
  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;
  const MONTH = 30.44 * DAY; // Average month length
  const YEAR = 365.25 * DAY; // Account for leap years

  if (diffInMs < MINUTE) return "Just now";

  const intervals = [
    { label: "y", value: YEAR },
    { label: "mo", value: MONTH },
    { label: "w", value: WEEK },
    { label: "d", value: DAY },
    { label: "h", value: HOUR },
    { label: "m", value: MINUTE },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInMs / interval.value);
    if (count >= 1) {
      return `${count}${interval.label} ago`;
    }
  }

  return "Just now";
};
