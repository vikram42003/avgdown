import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/database/prisma/prisma.service";
import { UserResponseDto } from "./users.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<UserResponseDto[]> {
    // Our nestjs-zod validation pipe will automatically strip sensitive fields like passwordHash
    return this.prisma.user.findMany();
  }

  
}
