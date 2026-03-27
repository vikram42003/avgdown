import { z } from "zod";

// Base

export const UserSchema = z.object({
  id: z.uuid().describe("The UUID id of the user"),
  email: z.email().describe("The email of the user"),
  passwordHash: z.string().optional().describe("The password hash of the user"),
  googleId: z.string().optional().describe("The Google ID of the user"),
  webhookUrl: z.url().optional().describe("The webhook URL set by the user"),
  createdAt: z.date().describe("The date and time when the user was created"),
  updatedAt: z.date().describe("The date and time when the user was updated"),
});

// Input: Frontend -> Backend

export const UserRegisterSchema = UserSchema.pick({ email: true, webhookUrl: true }).extend({
  password: z.string().min(8).describe("Plain text password"),
});

export const UserLoginSchema = z.object({
  email: z.email().describe("The email of the user"),
  password: z.string().min(1).describe("The password of the user"),
});

// (Update)Input: Frontend -> Backend

export const UserUpdateSchema = UserSchema.pick({
  email: true,
  webhookUrl: true,
}).partial();

// Response: Backend -> Frontend

export const UserResponseSchema = UserSchema.omit({ passwordHash: true, googleId: true }).extend({
  createdAt: z.iso.datetime().describe("ISO timestamp when the entry was created"),
  updatedAt: z.iso.datetime().describe("ISO timestamp when the entry was last updated"),
});

// Inferred Types

export type User = z.infer<typeof UserSchema>;
export type UserRegister = z.infer<typeof UserRegisterSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
