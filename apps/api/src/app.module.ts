import { ZodValidationPipe, ZodSerializerInterceptor, ZodSerializationException } from "nestjs-zod";
import { APP_PIPE, APP_INTERCEPTOR, APP_FILTER, BaseExceptionFilter } from "@nestjs/core";
import { ZodError } from "zod";
import { Logger, Module, HttpException, ArgumentsHost, Catch } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { LoggerInterceptor } from "./common/interceptors/logger/logger.interceptor";
import { WatchlistsModule } from "./watchlists/watchlists.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./common/database/prisma/prisma.module";
import { AssetsModule } from "./assets/assets.module";

@Catch(HttpException)
class HttpExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    if (exception instanceof ZodSerializationException) {
      const zodError = exception.getZodError();

      if (zodError instanceof ZodError) {
        this.logger.error(`ZodSerializationException: ${zodError.message}`);
      }
    }

    super.catch(exception, host);
  }
}

@Module({
  imports: [
    WatchlistsModule,
    UsersModule,
    AuthModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env.local" }),
    AssetsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
