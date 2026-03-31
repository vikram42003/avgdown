import { Injectable } from "@nestjs/common";
import { User } from "@avgdown/db";
import { UserResponseSchema } from "@avgdown/types";
import * as bcrypt from "bcrypt";

import { UserResponseDto } from "./users.dto";
import { PrismaService } from "../common/database/prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<UserResponseDto[]> {
    return this.prisma.user.findMany().then((users) => users.map((user) => UserResponseSchema.parse(user)));
  }

  async findMe(user: { id: string; email: string }): Promise<UserResponseDto> {
    return this.prisma.user.findUnique({ where: { id: user.id } }).then((user) => UserResponseSchema.parse(user));
  }

  async findUserByEmailHelper(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async upsertUser(data: { email: string; password?: string; googleId?: string }) {
    const { email, password, googleId } = data;

    const updateData: { googleId?: string; passwordHash?: string } = {};
    if (googleId) updateData.googleId = googleId;

    let passwordHash: string | undefined;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
      updateData.passwordHash = passwordHash;
    }

    return this.prisma.user.upsert({
      where: { email },
      update: updateData,
      create: {
        email,
        googleId,
        passwordHash,
      },
    });
  }
}
