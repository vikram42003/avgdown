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
      this.logger.warn("Unauthorized access - No Token");
      throw new UnauthorizedException();
    }

    try {
      const { id, email }: { id: unknown; email: unknown } = await this.jwtService.verifyAsync(token);

      if (!id || typeof id !== "string" || !email || typeof email !== "string") {
        this.logger.warn("Unauthorized access - Invalid Payload in the decoded Jwt");
      }

      request.user = { id, email };
      return true;
    } catch {
      this.logger.warn("Unauthorized access - Invalid Token");
      throw new UnauthorizedException();
    }
  }
}
