import { Injectable } from "@nestjs/common";
import { User } from "@avgdown/db";
import { UserResponseSchema } from "@avgdown/types";

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
}
