import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import type { AuthenticatedRequest } from "./users.dto";
import { UserResponseDto } from "./users.dto";
import { DevOnlyGuard } from "../common/guards/dev-only/dev-only.guard";
import { AuthGuard } from "@nestjs/passport";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
}
