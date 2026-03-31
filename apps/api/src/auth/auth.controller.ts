import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthResponse } from "@avgdown/types";
import type { GoogleOAuthRequest } from "./auth.dto";

import { AuthService } from "./auth.service";
import { UserLoginDto } from "./auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("oauth/google")
  @UseGuards(AuthGuard("google"))
  async googleOAuthLogin() {
    // The AuthGuard handles the redirect to Google; no logic needed here.
  }

  @Get("oauth/google/callback")
  @UseGuards(AuthGuard("google"))
  async googleOAuthCallback(@Req() req: GoogleOAuthRequest): Promise<AuthResponse> {
    return this.authService.googleLoginOrCreateUser(req.user);
  }

  @Post("login")
  login(@Body() loginDetails: UserLoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDetails);
  }
}
