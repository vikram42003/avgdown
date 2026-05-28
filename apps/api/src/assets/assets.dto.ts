import { createZodDto } from "nestjs-zod";
import { AssetResponseSchema, AssetSearchResultSchema } from "@avgdown/types";

export class AssetResponseDto extends createZodDto(AssetResponseSchema) {}
export class AssetSearchResultDto extends createZodDto(AssetSearchResultSchema) {}
