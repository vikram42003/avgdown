import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthResponse } from "@avgdown/types";
import type { GoogleOAuthRequest } from "./auth.dto";

import { AuthService } from "./auth.service";
import { UserLoginDto } from "./auth.dto";
import { ConfigService } from "@nestjs/config";
import type { Response } from "express";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get("oauth/google")
  @UseGuards(AuthGuard("google"))
  async googleOAuthLogin() {
    // The AuthGuard handles the redirect to Google; no logic needed here.
  }

  @Get("oauth/google/callback")
  @UseGuards(AuthGuard("google"))
  async googleOAuthCallback(@Req() req: GoogleOAuthRequest, @Res() res: Response) {
    const accessToken = await this.authService.googleLoginOrCreateUser(req.user);
    const redirectURL = this.configService.get<string>("FRONTEND_URL", "http://localhost:3000");

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: this.configService.get("NODE_ENV") === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return res.redirect(`${redirectURL}?success=true`);
  }

  @Post("login")
  async login(@Body() loginDetails: UserLoginDto, @Res({ passthrough: true }) res: Response): Promise<AuthResponse> {
    const accessToken = await this.authService.login(loginDetails);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: this.configService.get("NODE_ENV") === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  }
}
