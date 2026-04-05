import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserResponse, UserResponseSchema } from "@avgdown/types";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

import { UserLoginDto } from "./auth.dto";
import { UsersService } from "src/users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDetails: UserLoginDto): Promise<string> {
    const user = await this.validateUser(loginDetails);
    return this.generateToken(user);
  }

  private generateToken(user: UserResponse): string {
    return this.jwtService.sign({
      id: user.id,
      email: user.email,
    });
  }

  private async validateUser(userDetails: UserLoginDto): Promise<UserResponse> {
    const user = await this.userService.findUserByEmailHelper(userDetails.email);
    if (!user?.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(userDetails.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return UserResponseSchema.parse(user);
  }

  async googleLoginOrCreateUser({ email, googleId }: { email: string; googleId: string }): Promise<string> {
    const user = await this.userService.upsertUser({ email, googleId });
    const userResponse = UserResponseSchema.parse(user);

    return this.generateToken(userResponse);
  }
}
