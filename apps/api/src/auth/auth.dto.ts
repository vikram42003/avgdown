import { createZodDto } from "nestjs-zod";
import { UserLoginSchema, UserRegisterSchema } from "@avgdown/types";

export class UserLoginDto extends createZodDto(UserLoginSchema) {}
export class UserRegisterDto extends createZodDto(UserRegisterSchema) {}
