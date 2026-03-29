import { createZodDto } from "nestjs-zod";
import { UserUpdateSchema, UserResponseSchema } from "@avgdown/types";

export class UserUpdateDto extends createZodDto(UserUpdateSchema) {}
export class UserResponseDto extends createZodDto(UserResponseSchema) {}