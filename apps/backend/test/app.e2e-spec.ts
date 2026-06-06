import 'reflect-metadata';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  before(async () => {
    const moduleRef = await NestFactory.create(AppModule);
    app = moduleRef;
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  after(async () => {
    await app.close();
  });

  it('registers, logs in, accesses profile, and logs out', async () => {
    const email = `user-${Date.now()}@example.com`;
    const password = 'password123';

    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password })
      .expect(201);

    assert.ok(registerResponse.body.accessToken);
    assert.ok(registerResponse.body.refreshToken);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);

    const { accessToken, refreshToken } = loginResponse.body;

    const profileResponse = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    assert.equal(profileResponse.body.email, email);

    await request(app.getHttpServer()).post('/api/auth/logout').send({ refreshToken }).expect(204);

    await request(app.getHttpServer()).post('/api/auth/refresh').send({ refreshToken }).expect(401);
  });
});
