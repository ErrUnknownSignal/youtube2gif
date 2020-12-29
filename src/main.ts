import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import {join} from "path";
import {ValidationPipe} from "@nestjs/common";

const DOWNLOAD_PATH = join(__dirname, '..', 'public', 'download');

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(
      AppModule,
  );

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();

export { DOWNLOAD_PATH }
