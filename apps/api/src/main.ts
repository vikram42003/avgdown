import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

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
              : nestWinstonModuleUtilities.format.nestLike('AvgDown', {
                  colors: true,
                  prettyPrint: true,
                }),
          ),
        }),
      ],
    }),
  });
  await app.listen(process.env.PORT_API ?? 3001);
}

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});
