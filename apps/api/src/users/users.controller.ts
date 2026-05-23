import { Controller, Get, Req, UseGuards, Patch, Delete, Body, Res } from "@nestjs/common";
import { UsersService } from "./users.service";
import type { AuthenticatedRequest } from "./users.dto";
import { UserResponseDto, UserUpdateDto } from "./users.dto";
import { DevOnlyGuard } from "../common/guards/dev-only/dev-only.guard";
import { AuthGuard } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import type { Response } from "express";

@Controller("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(DevOnlyGuard)
  @Get()
  findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("/me")
  getMe(@Req() request: AuthenticatedRequest): Promise<UserResponseDto> {
    return this.usersService.findMe(request.user);
  }

  @UseGuards(AuthGuard("jwt"))
  @Patch("/me")
  updateMe(@Req() request: AuthenticatedRequest, @Body() updateDto: UserUpdateDto): Promise<UserResponseDto> {
    return this.usersService.updateMe(request.user.id, updateDto);
  }

  @UseGuards(AuthGuard("jwt"))
  @Delete("/me")
  async deleteMe(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ success: boolean }> {
    await this.usersService.deleteMe(request.user.id);
    response.clearCookie("accessToken", {
      httpOnly: true,
      secure: this.configService.get("NODE_ENV") === "production",
      sameSite: "lax",
    });
    return { success: true };
  }
}
