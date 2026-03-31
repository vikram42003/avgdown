import { createZodDto } from "nestjs-zod";
import { UserLoginSchema, UserRegisterSchema } from "@avgdown/types";
import { type Request } from "express";

export class UserLoginDto extends createZodDto(UserLoginSchema) {}
export class UserRegisterDto extends createZodDto(UserRegisterSchema) {}

export interface GoogleOAuthRequest extends Request {
  user: {
    googleId: string;
    email: string;
  };
}
