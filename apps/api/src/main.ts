import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

console.log(process.env.SOMETHING);

async function bootstrap() {
  console.log(process.env.PORT_API);
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT_API ?? 3001);
}

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});
