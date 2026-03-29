import { createZodDto } from "nestjs-zod";
import { WatchlistEntryResponseSchema, WatchlistEntryUpdateSchema, WatchlistEntryCreateSchema } from "@avgdown/types";

export class WatchlistEntryResponseDto extends createZodDto(WatchlistEntryResponseSchema) {}
export class WatchlistEntryUpdateDto extends createZodDto(WatchlistEntryUpdateSchema) {}
export class WatchlistEntryCreateDto extends createZodDto(WatchlistEntryCreateSchema) {}
