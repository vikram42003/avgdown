import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class DevOnlyGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    if (process.env.NODE_ENV !== "development") {
      throw new ForbiddenException("This is a development only route");
    }
    return true;
  }
}
