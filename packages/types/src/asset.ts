import z from "zod/v4";

export const SupportedExchangesEnum = z.enum(["NASDAQ", "NYSE", "NSE", "BSE", "BINANCE", "COINBASE"]);
export const AssetTypeEnum = z.enum(["STOCK", "CRYPTO", "ETF"]);

export type Exchange = z.infer<typeof SupportedExchangesEnum>;
export type AssetType = z.infer<typeof AssetTypeEnum>;

// Base - Asset

export const AssetSchema = z.object({
  id: z.uuid().describe("Unique identifier for the asset schema"),
  symbol: z.string().describe("The ticker symbol of the asset"),
  exchange: SupportedExchangesEnum.describe("The exchange where the asset is traded"),
  name: z.string().describe("The name of the asset"),
  assetType: AssetTypeEnum.describe("The type of the asset"),
  isPopular: z.boolean().default(false).describe("Whether this asset appears in the popular/browse grid"),
  createdAt: z.date().describe("The date and time when the asset was seeded/created"),
});

// Response: Backend -> Frontend

export const AssetResponseSchema = AssetSchema.extend({
  createdAt: z.union([z.date(), z.iso.datetime()]).describe("ISO string representation of createdAt"),
});

// Search result from Yahoo Finance — may or may not exist in our DB

export const AssetSearchResultSchema = z.object({
  symbol: z.string().describe("The ticker symbol"),
  name: z.string().describe("The display name of the asset"),
  exchange: z.string().describe("The exchange (may not match our enum for unsupported exchanges)"),
  assetType: z.string().describe("The asset type (STOCK, ETF, CRYPTO, etc.)"),
  existingAssetId: z.string().nullable().describe("DB asset ID if this asset already exists, null otherwise"),
});

// Base - Daily Price Snapshot

export const DailyPriceSnapshotSchema = z.object({
  id: z.uuid().describe("The UUID id of the daily price snapshot"),
  assetId: z.uuid().describe("The assetId that this close belongs to"),
  close: z.coerce.number().nonnegative().describe("The completed daily close price"),
  date: z.date().describe("The trading date for this close"),
  source: z.string().describe("The market data provider used for this close"),
  createdAt: z.date().describe("The date and time when the snapshot was created"),
  updatedAt: z.date().describe("The date and time when the snapshot was last updated"),
});

// Response: Backend -> Frontend

export const DailyPriceSnapshotResponseSchema = DailyPriceSnapshotSchema.extend({
  date: z.union([z.date(), z.iso.datetime()]).describe("ISO string representation of date"),
  createdAt: z.union([z.date(), z.iso.datetime()]).describe("ISO string representation of createdAt"),
  updatedAt: z.union([z.date(), z.iso.datetime()]).describe("ISO string representation of updatedAt"),
});

// Inferred Types

export type Asset = z.infer<typeof AssetSchema>;
export type AssetResponse = z.infer<typeof AssetResponseSchema>;
export type AssetSearchResult = z.infer<typeof AssetSearchResultSchema>;

export type DailyPriceSnapshot = z.infer<typeof DailyPriceSnapshotSchema>;
export type DailyPriceSnapshotResponse = z.infer<typeof DailyPriceSnapshotResponseSchema>;

export const DailyChartPointSchema = z.object({
  date: z.union([z.date(), z.iso.datetime()]),
  close: z.coerce.number().nonnegative(),
  sma: z.number().nullable(),
});

export const DailyPriceChartDataSchema = z.object({
  points: z.array(DailyChartPointSchema),
  smaPeriod: z.number(),
  status: z.enum(["READY", "WARMING_UP"]),
});

export type DailyChartPoint = z.infer<typeof DailyChartPointSchema>;
export type DailyPriceChartDataResponse = z.infer<typeof DailyPriceChartDataSchema>;
