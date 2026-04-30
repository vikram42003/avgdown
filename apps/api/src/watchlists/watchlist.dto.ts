import { createZodDto } from "nestjs-zod";
import {
  WatchlistEntryResponseSchema,
  WatchlistEntryUpdateSchema,
  WatchlistEntryCreateSchema,
  PriceSnapshotResponseSchema,
  AlertResponseSchema,
  RecentAlertSchema,
  PriceSnapshotChartDataSchema,
} from "@avgdown/types";

export class WatchlistEntryResponseDto extends createZodDto(WatchlistEntryResponseSchema) {}
export class WatchlistEntryUpdateDto extends createZodDto(WatchlistEntryUpdateSchema) {}
export class WatchlistEntryCreateDto extends createZodDto(WatchlistEntryCreateSchema) {}
export class PriceSnapshotResponseDto extends createZodDto(PriceSnapshotResponseSchema) {}
export class AlertResponseDto extends createZodDto(AlertResponseSchema) {}
export class RecentAlertDto extends createZodDto(RecentAlertSchema) {}
export class ChartDataDto extends createZodDto(PriceSnapshotChartDataSchema) {}
