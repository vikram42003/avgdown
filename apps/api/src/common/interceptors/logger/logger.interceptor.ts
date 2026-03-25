import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";
import type { Request, Response } from "express";
import { UAParser } from "ua-parser-js";

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly internalLogger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const { method, url, ip } = request;

    // 1. Silence favicon noise
    if (url === "/favicon.ico") return next.handle();

    // 2. Parse the User-Agent
    const ua = request.get("user-agent") || "unknown";
    const parser = new UAParser(ua);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const deviceInfo = `${browser.name || "unknown"} ${browser.version || ""} on ${os.name || "unknown"} ${os.version || ""}`;

    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          if (process.env.NODE_ENV === "production") return;

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
