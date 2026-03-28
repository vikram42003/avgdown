import { z } from "zod";
import { WatchlistEntryResponseSchema } from "./watchlist.js";

// Base

export const AlertSchema = z.object({
  id: z.uuid().describe("Unique identifier for the alert"),
  watchlistEntryId: z.uuid().describe("The UUID of the watchlist entry that triggered this alert"),
  triggeredPrice: z.number().describe("The actual price of the asset when the alert triggered"),
  smaValue: z.number().describe("The Simple Moving Average value at the time the alert triggered"),
  delivered: z.boolean().default(false).describe("Whether the alert was successfully delivered via email/webhook"),
  deliveredAt: z.date().nullable().describe("The date and time when the alert was delivered"),
  createdAt: z.date().describe("The date and time when the alert was created"),
});

// Response: Backend -> Frontend

export const AlertResponseSchema = AlertSchema.omit({ watchlistEntryId: true }).extend({
  watchlistEntry: WatchlistEntryResponseSchema.describe("The full watchlist entry including the asset details"),
  deliveredAt: z.iso.datetime().nullable().describe("ISO timestamp of delivery"),
  createdAt: z.iso.datetime().describe("ISO timestamp when the alert was created"),
});

// Inferred Types

export type Alert = z.infer<typeof AlertSchema>;
export type AlertResponse = z.infer<typeof AlertResponseSchema>;
