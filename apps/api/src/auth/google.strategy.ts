import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-google-oauth20";
import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>("GOOGLE_CLIENT_ID"),
      clientSecret: configService.getOrThrow<string>("GOOGLE_CLIENT_SECRET"),
      callbackURL: configService.getOrThrow<string>("GOOGLE_CALLBACK_URL"),
      scope: ["openid", "email", "profile"],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile): { email: string; googleId: string } {
    const email = profile.emails?.[0]?.value;
    const googleId = profile.id;

    if (!email || !googleId) {
      this.logger.error("Invalid Google OAuth response - It should always return a googleId and email");
      throw new InternalServerErrorException("Invalid Google OAuth response");
    }

    return {
      email,
      googleId,
    };
  }
}
