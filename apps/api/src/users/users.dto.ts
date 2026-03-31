import { createZodDto } from "nestjs-zod";
import { UserUpdateSchema, UserResponseSchema } from "@avgdown/types";
import { Request } from "express";

export class UserUpdateDto extends createZodDto(UserUpdateSchema) {}
export class UserResponseDto extends createZodDto(UserResponseSchema) {}
export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}
