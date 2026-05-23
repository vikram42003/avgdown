import { z } from "zod/v4";
import { WatchlistEntryResponseSchema } from "./watchlist.js";
import { SupportedExchangesEnum } from "./asset.js";

// Base

export const AlertSchema = z.object({
  id: z.uuid().describe("Unique identifier for the alert"),
  watchlistEntryId: z.uuid().nullable().describe("The UUID of the watchlist entry that triggered this alert"),
  userId: z.uuid().describe("ID of the user who owns this alert"),
  symbol: z.string().describe("Ticker symbol of the asset at trigger time"),
  exchange: SupportedExchangesEnum.describe("Exchange where the asset was monitored"),
  smaPeriod: z.number().int().min(1).max(250).describe("SMA period used for trigger condition"),
  assetName: z.string().describe("Asset name at trigger time"),
  triggeredPrice: z.coerce.number().describe("The actual price of the asset when the alert triggered"),
  smaValue: z.coerce.number().describe("The Simple Moving Average value at the time the alert triggered"),
  delivered: z.boolean().default(false).describe("Whether the alert was successfully delivered via email/webhook"),
  deliveredAt: z.date().nullable().describe("The date and time when the alert was delivered"),
  createdAt: z.date().describe("The date and time when the alert was created"),
});

// Response: Backend -> Frontend

export const AlertResponseSchema = AlertSchema.omit({ watchlistEntryId: true }).extend({
  watchlistEntry: WatchlistEntryResponseSchema.nullable().describe("The full watchlist entry including the asset details"),
  deliveredAt: z.union([z.date(), z.iso.datetime()]).nullable().describe("ISO timestamp of delivery"),
  createdAt: z.union([z.date(), z.iso.datetime()]).describe("ISO timestamp when the alert was created"),
});

// Lean Recent Alert for Dashboard
export const RecentAlertSchema = z.object({
  id: z.uuid(),
  triggeredPrice: z.coerce.number(),
  smaValue: z.coerce.number(),
  createdAt: z.union([z.date(), z.iso.datetime()]),
  watchlistEntry: z.object({
    smaPeriod: z.number(),
    asset: z.object({
      symbol: z.string(),
      name: z.string(),
      exchange: SupportedExchangesEnum,
    }),
  }),
});

// Inferred Types

export type Alert = z.infer<typeof AlertSchema>;
export type AlertResponse = z.infer<typeof AlertResponseSchema>;
export type RecentAlertResponse = z.infer<typeof RecentAlertSchema>;
