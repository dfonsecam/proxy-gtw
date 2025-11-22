import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('ProxyMiddleware (e2e)', () => {
  let app: INestApplication;

  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication({
      bodyParser: false,
    });
    await app.init();

    // Generate JWT token for tests
    const jwt = require('jsonwebtoken');
    jwtToken = jwt.sign(
      { sub: 'test-user' },
      process.env.JWT_SECRET || 'my-super-secret-value',
      {
        algorithm: 'HS256',
        expiresIn: '1h',
      },
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('should proxy /api/clients requests and return valid data', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/clients')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(10);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('email');
  });

  it('should proxy /api/members requests and return valid data', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/members')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(10);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('email');
  });

  it('should proxy /oauth/token requests and return valid data', async () => {
    const res = await request(app.getHttpServer())
      .post('/oauth/token')
      .send({
        client_id: 'client-id',
        client_secret: 'client-secret',
      })
      .expect(200);
    expect(res.body).toHaveProperty('access_token');
    expect(res.body).toHaveProperty('token_type');
    expect(res.body).toHaveProperty('expires_in');
  });

  it('should return 502 for unknown routes', async () => {
    const res = await request(app.getHttpServer()).get('/unknown').expect(502);
    expect(res.body.message).toContain('Service unavailable');
  });
});
