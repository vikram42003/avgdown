import z from "zod";

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
  createdAt: z.date().describe("The date and time when the asset was seeded/created"),
});

// Response: Backend -> Frontend

export const AssetResponseSchema = AssetSchema.extend({
  createdAt: z.union([z.date(), z.iso.datetime()]).describe("ISO string representation of createdAt"),
});

// Base - Price Snapshot

export const PriceSnapshotSchema = z.object({
  id: z.uuid().describe("The UUID id of the price snapshot"),
  assetId: z.uuid().describe("The assetId that this price belongs to"),
  price: z.coerce.number().nonnegative().describe("The numerical price of the asset at the specific time"),
  fetchedAt: z.date().describe("The date and time when the price was fetched"),
});

// Response: Backend -> Frontend

export const PriceSnapshotResponseSchema = PriceSnapshotSchema.extend({
  fetchedAt: z.union([z.date(), z.iso.datetime()]).describe("ISO string representation of fetchedAt"),
});

// Inferred Types

export type Asset = z.infer<typeof AssetSchema>;
export type AssetResponse = z.infer<typeof AssetResponseSchema>;

export type PriceSnapshot = z.infer<typeof PriceSnapshotSchema>;
export type PriceSnapshotResponse = z.infer<typeof PriceSnapshotResponseSchema>;

export const PriceSnapshotChartDataSchema = z.object({
  prices: z.array(PriceSnapshotResponseSchema),
  /** One SMA value per price point. null for early points before the window is full. */
  sma: z.array(z.number().nullable()),
  smaPeriod: z.number(),
});

export type PriceSnapshotChartDataResponse = z.infer<typeof PriceSnapshotChartDataSchema>;

// Daily SMA Snapshot (stored by the sma_worker Lambda, served by the chart endpoint)

export const DailySmaSnapshotSchema = z.object({
  id: z.uuid(),
  assetId: z.uuid(),
  period: z.number().int(),
  smaValue: z.coerce.number(),
  date: z.union([z.date(), z.iso.datetime()]),
});

export type DailySmaSnapshot = z.infer<typeof DailySmaSnapshotSchema>;
