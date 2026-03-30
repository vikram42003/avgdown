import { UserResponseSchema } from "@avgdown/types";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { type Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    const token = authorization?.split(" ")[1];

    if (!token) {
      this.logger.warn("Unauthorized access detected - No Token");
      throw new UnauthorizedException();
    }

    try {
      const tokenPayload: unknown = await this.jwtService.verifyAsync(token);
      const user = UserResponseSchema.parse(tokenPayload);
      request.user = {
        id: user.id,
        email: user.email,
        webhookUrl: user.webhookUrl,
      };
      return true;
    } catch {
      this.logger.warn("Unauthorized access detected - Invalid Token");
      throw new UnauthorizedException();
    }
  }
}
