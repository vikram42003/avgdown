import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Observable, tap } from "rxjs";
import type { Request, Response } from "express";
import { UAParser } from "ua-parser-js";

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly internalLogger = new Logger("HTTP");

  constructor(private readonly configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // Skip if we're in prod, for now
    if (this.configService.get("NODE_ENV") === "production") return next.handle();

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const { method, url, ip } = request;

    if (url === "/favicon.ico") return next.handle();

    const ua = request.get("user-agent") || "unknown";
    const parser = new UAParser(ua);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const deviceInfo = `${browser.name || "unknown"} ${browser.version || ""} on ${os.name || "unknown"} ${os.version || ""}`;

    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = http.getResponse<Response>();
          const { statusCode } = response;
          const duration = Date.now() - start;

          this.internalLogger.log(`${method} ${url} ${statusCode} - ${duration}ms (${ip} - ${deviceInfo.trim()})`);
        },
        error: (err: Error) => {
          const duration = Date.now() - start;
          this.internalLogger.error(`${method} ${url} - ${duration}ms (${ip} - ${deviceInfo.trim()})`, err.stack);
        },
      }),
    );
  }
}
