import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('gif api test', () => {
    return request(app.getHttpServer())
        .post('/api/gif-stream')
        .send({v: 'dQw4w9WgXcQ', start: 0, time: 3, quality: 0})
        .expect(200);
  });

  it('image api test', () => {
    return request(app.getHttpServer())
        .post('/api/image-stream')
        .send({v: 'dQw4w9WgXcQ', start: 0, quality: 0})
        .expect(200);
  });

  it('mp3 api test', () => {
    return request(app.getHttpServer())
        .post('/api/mp3-stream')
        .send({v: 'dQw4w9WgXcQ', start: 0, time: 3, quality: 0})
        .expect(200);
  });

  afterEach(async () => {
    await app.close();
  });
});
