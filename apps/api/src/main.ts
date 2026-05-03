import { cleanupOpenApiDoc } from "nestjs-zod";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";

import { WinstonModule, utilities as nestWinstonModuleUtilities } from "nest-winston";
import * as winston from "winston";

const isProduction = process.env.NODE_ENV === "production";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            isProduction
              ? winston.format.json()
              : nestWinstonModuleUtilities.format.nestLike("AvgDown", {
                  colors: true,
                  prettyPrint: true,
                }),
          ),
        }),
      ],
    }),
  });

  // cookie parser
  app.use(cookieParser());

  // Decided to expose the Swagger docs endpoint since this is a portfolio project
  const openApiDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle("AvgDown API")
      .setDescription("The (Private) backend for the AvgDown service")
      .setVersion("0.1.0")
      .addBearerAuth()
      .build(),
  );
  SwaggerModule.setup("api", app, cleanupOpenApiDoc(openApiDoc));

  const configService = app.get(ConfigService);

  // Enable CORS only for local frontend, for now
  const allowedOrigins = ["http://localhost:3000"];
  const frontendUrl = configService.get<string>("FRONTEND_URL");
  if (frontendUrl) {
    allowedOrigins.push(frontendUrl.replace(/\/$/, ""));
  }
  app.enableCors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });

  await app.listen(configService.get<string>("PORT") || "3001");
}

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});
