import {NestFactory} from '@nestjs/core';
import {NestExpressApplication} from '@nestjs/platform-express';
import {AppModule} from './app.module';
import {join} from "path";
import {ValidationPipe} from "@nestjs/common";

const DOWNLOAD_PATH = join(__dirname, '..', 'public', 'download');
const CONSUMER_GROUP = 'y2g-worker';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(
      AppModule,
  );

  // OPTIONS
  // Database options
  // DB_HOST, DB_USER, DB_PWD, DB_NAME

  // Encoding Queue Options
  // ENCODING_SERVER: undefined, KAFKA_SERVER: undefined = API and Self Encoding (DEFAULT)
  // ENCODING_SERVER: undefined, KAFKA_SERVER: not-empty = Only API Server, not Encoding in this server
  // ENCODING_SERVER: not-empty, KAFKA_SERVER: undefined = API and Self Encoding (DEFAULT)
  // ENCODING_SERVER: not-empty, KAFKA_SERVER: not-empty = API with Distributed Encoding

  if (!process.env.ENCODING_SERVER && !process.env.KAFKA_SERVER) {
    process.env.ENCODING_SERVER = 'true';
  }

  app.useGlobalPipes(new ValidationPipe( { transform: true, transformOptions: {enableImplicitConversion: true}}));
  if (process.env.KAFKA_SERVER) {
    await app.startAllMicroservicesAsync();
  }
  await app.listen(3000);
}
bootstrap();

export { DOWNLOAD_PATH, CONSUMER_GROUP }
