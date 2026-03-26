import { z } from "zod";

export const WatchlistEntrySchema = z.object({
  id: z.uuid().describe("The UUID id of the watchlist entry"),
  userId: z.uuid().describe("The userId of user who created the watchlist entry"),
  assetId: z.uuid().describe("The assetId of the asset to be added to the watchlist"),
  smaPeriod: z
    .number()
    .min(1)
    .max(250)
    .default(20)
    .describe("The SMA period of the asset being tracked by this watchlist"),
  isActive: z.boolean().default(true).describe("Whether the watchlist entry is active"),
  createdAt: z.date().describe("The date and time when the watchlist entry was created"),
  updatedAt: z.date().describe("The date and time when the watchlist entry was updated"),
});

export const CreateWatchlistEntrySchema = WatchlistEntrySchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateWatchlistEntrySchema = CreateWatchlistEntrySchema.partial();

export type WatchlistEntry = z.infer<typeof WatchlistEntrySchema>;
export type CreateWatchlistEntry = z.infer<typeof CreateWatchlistEntrySchema>;
export type UpdateWatchlistEntry = z.infer<typeof UpdateWatchlistEntrySchema>;
