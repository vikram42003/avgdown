import { cleanupOpenApiDoc, ZodValidationPipe } from "nestjs-zod";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";

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
  app.useGlobalPipes(new ZodValidationPipe());

  const configService = app.get(ConfigService);
  await app.listen(configService.getOrThrow<number>("PORT"));
}

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});
