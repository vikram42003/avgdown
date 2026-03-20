import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT_WORKER ?? 3002);
}

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});
