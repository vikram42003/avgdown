import { Body, Controller, Post } from "@nestjs/common";
import { AuthResponse } from "@avgdown/types";

import { AuthService } from "./auth.service";
import { UserLoginDto } from "./auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Body() loginDetails: UserLoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDetails);
  }
}
