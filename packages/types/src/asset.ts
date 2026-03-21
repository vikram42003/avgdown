export const SUPPORTED_EXCHANGES = ["NASDAQ", "NYSE", "NSE", "BSE", "BINANCE", "COINBASE"] as const;

export type Exchange = (typeof SUPPORTED_EXCHANGES)[number];
