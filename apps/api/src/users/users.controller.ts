import { Controller, Get, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UserResponseDto } from "./users.dto";
import { DevOnlyGuard } from "src/common/guards/dev-only/dev-only.guard";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(DevOnlyGuard)
  @Get()
  findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }
}
