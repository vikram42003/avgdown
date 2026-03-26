import { z } from "zod";

export const UserSchema = z.object({
  id: z.uuid().describe("The UUID id of the user"),
  email: z.email().describe("The email of the user"),
  passwordHash: z.string().optional().describe("The password hash of the user"),
  googleId: z.string().optional().describe("The Google ID of the user"),
  webhookUrl: z.url().optional().describe("The webhook URL set by the user"),
  createdAt: z.date().describe("The date and time when the user was created"),
  updatedAt: z.date().describe("The date and time when the user was updated"),
});

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateUserSchema = CreateUserSchema.partial();

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
