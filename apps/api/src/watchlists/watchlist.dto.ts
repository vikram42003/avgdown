import { createZodDto } from "nestjs-zod";
import {
  WatchlistEntryResponseSchema,
  WatchlistEntryUpdateSchema,
  WatchlistEntryCreateSchema,
  DailyPriceSnapshotResponseSchema,
  AlertResponseSchema,
  RecentAlertSchema,
  DailyPriceChartDataSchema,
} from "@avgdown/types";

export class WatchlistEntryResponseDto extends createZodDto(WatchlistEntryResponseSchema) {}
export class WatchlistEntryUpdateDto extends createZodDto(WatchlistEntryUpdateSchema) {}
export class WatchlistEntryCreateDto extends createZodDto(WatchlistEntryCreateSchema) {}
export class DailyPriceSnapshotResponseDto extends createZodDto(DailyPriceSnapshotResponseSchema) {}
export class AlertResponseDto extends createZodDto(AlertResponseSchema) {}
export class RecentAlertDto extends createZodDto(RecentAlertSchema) {}
export class ChartDataDto extends createZodDto(DailyPriceChartDataSchema) {}
