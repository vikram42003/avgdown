import { z } from "zod";
import { AssetResponseSchema } from "./asset.js";

// Base

export const WatchlistEntrySchema = z.object({
  id: z.uuid().describe("Unique identifier for the watchlist entry"),
  userId: z.uuid().describe("ID of the user who owns this entry"),
  assetId: z.uuid().describe("ID of the asset being tracked"),
  smaPeriod: z
    .number()
    .int()
    .min(1)
    .max(250)
    .default(20)
    .describe("Number of price snapshots used to calculate the SMA"),
  isActive: z.boolean().default(true).describe("Whether this watchlist entry is actively being monitored"),
  createdAt: z.date().describe("Timestamp when the entry was created"),
  updatedAt: z.date().describe("Timestamp when the entry was last updated"),
});

// Input: Frontend -> Backend

export const WatchlistEntryCreateSchema = WatchlistEntrySchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

// (Update)Input: Frontend -> Backend (partial)

export const WatchlistEntryUpdateSchema = WatchlistEntryCreateSchema.partial();

// Response: Backend -> Frontend

export const WatchlistEntryResponseSchema = WatchlistEntrySchema.omit({ userId: true, assetId: true }).extend({
  asset: AssetResponseSchema.describe("The fully populated asset for this entry"),
  createdAt: z.iso.datetime().describe("ISO timestamp when the entry was created"),
  updatedAt: z.iso.datetime().describe("ISO timestamp when the entry was last updated"),
});

// Inferred types

export type WatchlistEntry = z.infer<typeof WatchlistEntrySchema>;
export type WatchlistEntryCreateDto = z.infer<typeof WatchlistEntryCreateSchema>;
export type WatchlistEntryUpdateDto = z.infer<typeof WatchlistEntryUpdateSchema>;
export type WatchlistEntryResponse = z.infer<typeof WatchlistEntryResponseSchema>;
