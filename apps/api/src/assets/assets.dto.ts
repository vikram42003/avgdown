import { createZodDto } from "nestjs-zod";
import { AssetResponseSchema } from "@avgdown/types";

export class AssetResponseDto extends createZodDto(AssetResponseSchema) {}
