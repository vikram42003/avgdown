import { Injectable, NotFoundException, Logger, ConflictException } from "@nestjs/common";
import { User } from "@avgdown/db";
import { UserResponseSchema } from "@avgdown/types";
import * as bcrypt from "bcrypt";

import { UserResponseDto, UserUpdateDto } from "./users.dto";
import { PrismaService } from "../common/database/prisma/prisma.service";
import { truncateId, redactEmail } from "../common/utils/redact";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(private readonly prisma: PrismaService) {}

  private isPrismaError(error: unknown, code: string): boolean {
    return typeof error === "object" && error !== null && "code" in error && error.code === code;
  }

  private async updateExistingAuthUser(
    user: User,
    data: { email: string; googleId?: string; passwordHash?: string },
  ): Promise<User> {
    const { email, googleId, passwordHash } = data;

    if (user.email !== email) {
      this.logger.log(
        `Google email drift detected: Updating email for user ${truncateId(user.id)} from ${redactEmail(user.email)} to ${redactEmail(email)}`,
      );
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        googleId: googleId || user.googleId,
        passwordHash: passwordHash || user.passwordHash,
      },
    });
  }

  private async linkGoogleUserByEmail(email: string, googleId: string, passwordHash?: string): Promise<User | null> {
    try {
      const linkedUser = await this.prisma.user.update({
        where: { email },
        data: { googleId, ...(passwordHash ? { passwordHash } : {}) },
      });
      this.logger.log(`OAuth Link: Linking Google account to existing email-based user ${truncateId(linkedUser.id)}`);
      return linkedUser;
    } catch (error) {
      if (this.isPrismaError(error, "P2025")) {
        return null;
      }
      throw error;
    }
  }

  private async retryUserUpsertAfterUniqueConflict(
    error: unknown,
    data: { email: string; googleId?: string; passwordHash?: string },
  ): Promise<User> {
    if (!this.isPrismaError(error, "P2002")) {
      throw error;
    }

    const { email, googleId } = data;
    const existingUser =
      (googleId ? await this.prisma.user.findUnique({ where: { googleId } }) : null) ??
      (await this.prisma.user.findUnique({ where: { email } }));

    if (!existingUser) {
      throw error;
    }

    return this.updateExistingAuthUser(existingUser, data);
  }

  async findAll(): Promise<UserResponseDto[]> {
    return this.prisma.user.findMany().then((users) => users.map((user) => UserResponseSchema.parse(user)));
  }

  async findMe(user: { id: string; email: string }): Promise<UserResponseDto> {
    const foundUser = await this.prisma.user.findUnique({ where: { id: user.id } });
    if (!foundUser) {
      this.logger.warn(`Lookup failed: User with id ${truncateId(user.id)} not found`);
      throw new NotFoundException("User not found");
    }
    return UserResponseSchema.parse(foundUser);
  }

  async createUser(data: { email: string; password?: string }): Promise<User> {
    const { email, password } = data;

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      this.logger.warn(`Registration failed: User with email ${redactEmail(email)} already exists`);
      throw new ConflictException("User already exists");
    }

    let passwordHash: string | undefined;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    this.logger.log(`New user registered: ${redactEmail(email)} (via Credentials)`);
    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });
  }

  async upsertUser(data: { email: string; password?: string; googleId?: string }) {
    const { email, password, googleId } = data;

    let passwordHash: string | undefined;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    // Auth runs on the OAuth callback path, which is especially sensitive to cold-start
    // connection delays on free-tier/serverless databases. This is intentionally not an
    // interactive transaction: the User table's unique email/googleId constraints provide
    // the safety boundary, and rare races are resolved by retrying after P2002 conflicts.
    try {
      const userByGoogleId = googleId ? await this.prisma.user.findUnique({ where: { googleId } }) : null;
      if (userByGoogleId) {
        return this.updateExistingAuthUser(userByGoogleId, { email, googleId, passwordHash });
      }

      if (googleId) {
        const linkedUser = await this.linkGoogleUserByEmail(email, googleId, passwordHash);
        if (linkedUser) {
          return linkedUser;
        }
      }

      this.logger.log(`New user registered: ${redactEmail(email)} ${googleId ? "(via Google)" : "(via Credentials)"}`);
      return await this.prisma.user.create({
        data: {
          email,
          googleId,
          passwordHash,
        },
      });
    } catch (error) {
      return this.retryUserUpsertAfterUniqueConflict(error, { email, googleId, passwordHash });
    }
  }

  async findUserByEmailHelper(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async updateMe(userId: string, data: UserUpdateDto): Promise<UserResponseDto> {
    const updateData: { email?: string; webhookUrl?: string | null } = {};
    if (data.email !== undefined) {
      updateData.email = data.email;
    }
    if (data.webhookUrl !== undefined) {
      updateData.webhookUrl = data.webhookUrl;
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
      return UserResponseSchema.parse(updatedUser);
    } catch (error) {
      if (this.isPrismaError(error, "P2002")) {
        throw new ConflictException("Email already in use");
      }
      if (this.isPrismaError(error, "P2025")) {
        throw new NotFoundException("User not found");
      }
      throw error;
    }
  }

  async deleteMe(userId: string): Promise<void> {
    try {
      await this.prisma.user.delete({ where: { id: userId } });
      this.logger.log(`User deleted: ${truncateId(userId)}`);
    } catch (error) {
      if (this.isPrismaError(error, "P2025")) {
        this.logger.warn(`Deletion failed: User with id ${truncateId(userId)} not found`);
        throw new NotFoundException("User not found");
      }
      throw error;
    }
  }
}
