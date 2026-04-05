import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Observable } from "rxjs";

@Injectable()
export class DevOnlyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(_context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    if (this.configService.get("NODE_ENV") !== "development") {
      throw new ForbiddenException("This is a development only route");
    }
    return true;
  }
}
