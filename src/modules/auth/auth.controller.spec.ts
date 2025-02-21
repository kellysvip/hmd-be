import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  UnauthorizedException,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { Redis } from 'ioredis';

import { AppModule } from '../../app.module';
import {
  VALID_USER,
  INVALID_USER,
  USER_NOTFOUND,
} from '../../utils/test.utils';
import { AuthModule } from './auth.module';

jest.retryTimes(3);
jest.setTimeout(30000);

describe('AuthController', () => {
  describe('#Login', () => {
    let app: INestApplication;

    const testLoginEndPoint = '/auth/login';
    const validUsername = VALID_USER.username;
    const validPassword = VALID_USER.password;
    const invalidPassword = INVALID_USER.password;

    describe('#ExceedThrottling', () => {
      let redis: Redis;

      beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
          imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        redis = new Redis({
          host: '127.0.0.1',
          port: 6379,
          commandTimeout: 5000,
        });

        await app.init();
      });

      afterAll(async () => {
        await redis.quit();
        await app.close();
      });

      afterEach(async () => {
        await redis.flushall();
      });

      describe('#ExceedThrottling - Burst Remains', () => {
        it('UTCID00: Should allow requests below rate limit', async () => {
          for (let i = 0; i < 4; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(response.status).not.toBe(429);
          }
        });

        it('UTCID01: Should allow requests equal to rate limit', async () => {
          for (let i = 0; i < 5; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(response.status).not.toBe(429);
          }
        });

        it('UTCID02: Should allow requests exceeding rate limit but within burst limit', async () => {
          for (let i = 0; i < 6; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(response.status).not.toBe(429);
          }
        });

        it('UTCID03: Should allow requests exceeding rate limit but within burst limit', async () => {
          for (let i = 0; i < 14; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(response.status).not.toBe(429);
          }
        });

        it('UTCID04: Should allow requests exceeding rate limit but equal to burst limit', async () => {
          for (let i = 0; i < 15; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(response.status).not.toBe(429);
          }
        });

        it('UTCID05: Should reject requests exceeding burst limit', async () => {
          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer()).post(testLoginEndPoint).send({
              username: validUsername,
              password: validPassword,
            });
          }

          const response = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .send({
              username: validUsername,
              password: validPassword,
            });
          expect(response.status).toBe(429);
          expect(response.body.message).toBe('Vui lòng thử lại sau 30 giây');
        });
      });

      describe('#ExceedThrottling - Burst Recovery', () => {
        it('UTCID06: Should allow requests below rate limit', async () => {
          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer()).post(testLoginEndPoint).send({
              username: validUsername,
              password: validPassword,
            });
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));

          for (let i = 0; i < 4; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(response.status).not.toBe(429);
          }
        });

        it('UTCID07: Should allow requests euqal to rate limit', async () => {
          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer()).post(testLoginEndPoint).send({
              username: validUsername,
              password: validPassword,
            });
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));

          for (let i = 0; i < 5; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(response.status).not.toBe(429);
          }
        });

        it('UTCID08: Should allow requests greater than rate limit', async () => {
          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer()).post(testLoginEndPoint).send({
              username: validUsername,
              password: validPassword,
            });
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));

          for (let i = 0; i < 5; i++) {
            await request(app.getHttpServer()).post(testLoginEndPoint).send({
              username: validUsername,
              password: validPassword,
            });
          }

          const response = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .send({
              username: validUsername,
              password: validPassword,
            });
          expect(response.status).toBe(429);
          expect(response.body.message).toBe('Vui lòng thử lại sau 30 giây');
        });

        it('UTCID09: Should recover burst after 1 second with no requests', async () => {
          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer()).post(testLoginEndPoint).send({
              username: validUsername,
              password: validPassword,
            });
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));

          for (let i = 0; i < 5; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(response.status).not.toBe(429);
          }
        });

        it('UTCID10: Should fully recover burst after 3 seconds of no requests', async () => {
          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer()).post(testLoginEndPoint).send({
              username: validUsername,
              password: validPassword,
            });
          }

          await new Promise((resolve) => setTimeout(resolve, 3000));

          for (let i = 0; i < 15; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(response.status).not.toBe(429);
          }
        });

        it('UTCID11: Should fully recover burst after 4 seconds of no requests', async () => {
          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer()).post(testLoginEndPoint).send({
              username: validUsername,
              password: validPassword,
            });
          }

          await new Promise((resolve) => setTimeout(resolve, 3000));

          for (let i = 0; i < 15; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(response.status).not.toBe(429);
          }

          const res = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .send({
              username: validUsername,
              password: validPassword,
            });
          expect(res.status).toBe(429);
        });

        it('UTCID12: Should allow requests below rate limit after 2 seconds recovery', async () => {
          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer()).post(testLoginEndPoint).send({
              username: validUsername,
              password: validPassword,
            });
          }

          await new Promise((resolve) => setTimeout(resolve, 2000));

          for (let i = 0; i < 9; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(response.status).not.toBe(429);
          }
        });

        it('UTCID13: Should allow requests below rate limit after 2 seconds recovery', async () => {
          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer()).post(testLoginEndPoint).send({
              username: validUsername,
              password: validPassword,
            });
          }

          await new Promise((resolve) => setTimeout(resolve, 2000));

          for (let i = 0; i < 10; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(response.status).not.toBe(429);
          }
        });

        it('UTCID14: Should reject 11th request after 2 seconds recovery', async () => {
          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer()).post(testLoginEndPoint).send({
              username: validUsername,
              password: validPassword,
            });
          }

          await new Promise((resolve) => setTimeout(resolve, 2000));

          for (let i = 0; i < 10; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(response.status).not.toBe(429);
          }

          const res = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .send({
              username: validUsername,
              password: validPassword,
            });
          expect(res.status).toBe(429);
        });
      });

      describe('#ExceedThrottling - Consecutive User Request - Second User', () => {
        it('UTCID15: Should allow User 2 requests under rate limit', async () => {
          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.1')
              .send({
                username: validUsername,
                password: validPassword,
              });
          }

          await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.1')
            .send({
              username: validUsername,
              password: validPassword,
            })
            .expect(429);

          const response = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.2')
            .send({
              username: validUsername,
              password: validPassword,
            });

          expect(response.status).not.toBe(429);
        });

        it('UTCID16: Should allow User 2 requests equal to rate limit', async () => {
          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.1')
              .send({
                username: validUsername,
                password: validPassword,
              });
          }

          await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.1')
            .send({
              username: validUsername,
              password: validPassword,
            })
            .expect(429);

          for (let i = 0; i < 5; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });

            expect(response.status).not.toBe(429);
          }
        });

        it('UTCID17: Should allow User 2 requests greater than rate limit', async () => {
          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.1')
              .send({
                username: validUsername,
                password: validPassword,
              });
          }

          await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.1')
            .send({
              username: validUsername,
              password: validPassword,
            })
            .expect(429);

          for (let i = 0; i < 6; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });

            expect(response.status).not.toBe(429);
          }
        });

        it('UTCID18: Should allow User 2 requests under burst', async () => {
          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.1')
              .send({
                username: validUsername,
                password: validPassword,
              });
          }

          await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.1')
            .send({
              username: validUsername,
              password: validPassword,
            })
            .expect(429);

          for (let i = 0; i < 14; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });

            expect(response.status).not.toBe(429);
          }
        });

        it('UTCID19: Should allow User 2 requests equal to rate limit', async () => {
          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.1')
              .send({
                username: validUsername,
                password: validPassword,
              });
          }

          await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.1')
            .send({
              username: validUsername,
              password: validPassword,
            })
            .expect(429);

          for (let i = 0; i < 15; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });

            expect(response.status).not.toBe(429);
          }
        });

        it('UTCID20: Should allow User 2 requests greater than rate limit', async () => {
          for (let i = 0; i < 16; i++) {
            await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.1')
              .send({
                username: validUsername,
                password: validPassword,
              });
          }

          await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.1')
            .send({
              username: validUsername,
              password: validPassword,
            })
            .expect(429);

          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });
          }

          const response = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.2')
            .send({
              username: validUsername,
              password: validPassword,
            });
          expect(response.status).toBe(429);
        });
      });

      describe('#ExceedThrottling - Consecutive User Request - Second User - Burst Recovery', () => {
        it('UTCID21: Should allow User 2 requests under rate limit', async () => {
          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.1')
              .send({
                username: validUsername,
                password: validPassword,
              });
          }

          await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.1')
            .send({
              username: validUsername,
              password: validPassword,
            })
            .expect(429);

          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));

          const response = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.2')
            .send({
              username: validUsername,
              password: validPassword,
            });

          expect(response.status).not.toBe(429);
        });

        it('UTCID22: Should allow User 2 requests under rate limit', async () => {
          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.1')
              .send({
                username: validUsername,
                password: validPassword,
              });
          }

          await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.1')
            .send({
              username: validUsername,
              password: validPassword,
            })
            .expect(429);

          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));

          for (let i = 0; i < 5; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });

            expect(response.status).not.toBe(429);
          }
        });

        it('UTCID23: Should allow User 2 requests greater than rate limit', async () => {
          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.1')
              .send({
                username: validUsername,
                password: validPassword,
              });
          }

          await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.1')
            .send({
              username: validUsername,
              password: validPassword,
            })
            .expect(429);

          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));

          for (let i = 0; i < 5; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });

            expect(response.status).not.toBe(429);
          }
        });

        it('UTCID24: Should allow User 2 to send request after 1 second', async () => {
          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.1')
              .send({
                username: validUsername,
                password: validPassword,
              });
          }

          await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.1')
            .send({
              username: validUsername,
              password: validPassword,
            })
            .expect(429);

          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });
          }

          const firstResponse = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.2')
            .send({
              username: validUsername,
              password: validPassword,
            });

          expect(firstResponse.status).toBe(429);

          await new Promise((resolve) => setTimeout(resolve, 1000));

          for (let i = 0; i < 5; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(response.status).not.toBe(429);
          }
        });

        it('UTCID25: Should allow User 2 to send request after 3 seconds', async () => {
          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.1')
              .send({
                username: validUsername,
                password: validPassword,
              });
          }

          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });
          }

          const response = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.2')
            .send({
              username: validUsername,
              password: validPassword,
            });
          expect(response.status).toBe(429);

          await new Promise((resolve) => setTimeout(resolve, 3000));

          for (let i = 0; i < 15; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(response.status).not.toBe(429);
          }
        });

        it('UTCID26: Should allow User 2 to send request after 4 seconds', async () => {
          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.1')
              .send({
                username: validUsername,
                password: validPassword,
              });
          }

          await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.1')
            .send({
              username: validUsername,
              password: validPassword,
            })
            .expect(429);

          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });
          }

          const firstResponse = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.2')
            .send({
              username: validUsername,
              password: validPassword,
            });
          expect(firstResponse.status).toBe(429);

          await new Promise((resolve) => setTimeout(resolve, 4000));

          for (let i = 0; i < 15; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(response.status).not.toBe(429);
          }

          const secondResponse = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.2')
            .send({
              username: validUsername,
              password: validPassword,
            });
          expect(secondResponse.status).toBe(429);
        });

        it('UTCID27: Should allow User 2 to send request after 2 second', async () => {
          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.1')
              .send({
                username: validUsername,
                password: validPassword,
              });
          }

          await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.1')
            .send({
              username: validUsername,
              password: validPassword,
            })
            .expect(429);

          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });
          }

          const firstResponse = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.2')
            .send({
              username: validUsername,
              password: validPassword,
            });
          expect(firstResponse.status).toBe(429);

          await new Promise((resolve) => setTimeout(resolve, 2000));

          for (let i = 0; i < 9; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(response.status).not.toBe(429);
          }
        });

        it('UTCID28: Should allow User 2 to send request after 2 second', async () => {
          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.1')
              .send({
                username: validUsername,
                password: validPassword,
              });
          }

          await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.1')
            .send({
              username: validUsername,
              password: validPassword,
            })
            .expect(429);

          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });
          }

          const firstResponse = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.2')
            .send({
              username: validUsername,
              password: validPassword,
            });
          expect(firstResponse.status).toBe(429);

          await new Promise((resolve) => setTimeout(resolve, 2000));

          for (let i = 0; i < 10; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(response.status).not.toBe(429);
          }
        });

        it('UTCID29: Should allow User 2 to send request after 2 second', async () => {
          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.1')
              .send({
                username: validUsername,
                password: validPassword,
              });
          }

          await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.1')
            .send({
              username: validUsername,
              password: validPassword,
            })
            .expect(429);

          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });
          }

          const firstResponse = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.2')
            .send({
              username: validUsername,
              password: validPassword,
            });
          expect(firstResponse.status).toBe(429);

          await new Promise((resolve) => setTimeout(resolve, 2000));

          for (let i = 0; i < 10; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(response.status).not.toBe(429);
          }

          const response = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.2')
            .send({
              username: validUsername,
              password: validPassword,
            });
          expect(response.status).toBe(429);
        });
      });

      describe('#ExceedThrottling - Concurrency', () => {
        it('UTCID30: Should allow User 1 & User 2 to send 4 requests concurrently', async () => {
          for (let i = 0; i < 4; i++) {
            const firstResponse = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.1')
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(firstResponse.status).not.toBe(429);

            const secondResponse = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(secondResponse.status).not.toBe(429);
          }
        });

        it('UTCID31: Should allow User 1 & User 2 to send 5 requests concurrently', async () => {
          for (let i = 0; i < 5; i++) {
            const firstResponse = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.1')
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(firstResponse.status).not.toBe(429);

            const secondResponse = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(secondResponse.status).not.toBe(429);
          }
        });

        it('UTCID32: Should reject User 1 & User 2 to send 6 requests concurrently', async () => {
          for (let i = 0; i < 6; i++) {
            const firstResponse = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.1')
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(firstResponse.status).not.toBe(429);

            const secondResponse = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(secondResponse.status).not.toBe(429);
          }
        });

        it('UTCID33: Should allow User 1 & User 2 to send 14 requests concurrently', async () => {
          for (let i = 0; i < 14; i++) {
            const firstResponse = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.1')
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(firstResponse.status).not.toBe(429);

            const secondResponse = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(secondResponse.status).not.toBe(429);
          }
        });

        it('UTCID34: Should allow User 1 & User 2 to send 15 requests concurrently', async () => {
          for (let i = 0; i < 15; i++) {
            const firstResponse = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.1')
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(firstResponse.status).not.toBe(429);

            const secondResponse = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(secondResponse.status).not.toBe(429);
          }
        });

        it('UTCID35: Should reject User 1 & User 2 to send 16 requests concurrently', async () => {
          for (let i = 0; i < 15; i++) {
            await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.1')
              .send({
                username: validUsername,
                password: validPassword,
              });

            await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });
          }

          const firstResponse = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.1')
            .send({
              username: validUsername,
              password: validPassword,
            });
          expect(firstResponse.status).toBe(429);

          const secondResponse = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.2')
            .send({
              username: validUsername,
              password: validPassword,
            });
          expect(secondResponse.status).toBe(429);
        });

        it('UTCID36: Should reject if User 1 sends 15 requests and User 2 sends 16 requests concurrently', async () => {
          for (let i = 0; i < 15; i++) {
            if (i < 14)
              await request(app.getHttpServer())
                .post(testLoginEndPoint)
                .set('X-Forwarded-For', '192.168.1.1')
                .send({
                  username: validUsername,
                  password: validPassword,
                });

            await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('X-Forwarded-For', '192.168.1.2')
              .send({
                username: validUsername,
                password: validPassword,
              });
          }

          const firstResponse = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.1')
            .send({
              username: validUsername,
              password: validPassword,
            });
          expect(firstResponse.status).not.toBe(429);

          const secondResponse = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('X-Forwarded-For', '192.168.1.2')
            .send({
              username: validUsername,
              password: validPassword,
            });
          expect(secondResponse.status).toBe(429);
        });
      });

      describe('#ExceedThrottling - Request Consecutively In Miliseconds', () => {
        it('UTCID39: Should reject User if they send 10 at 0.1s, 5 at 0.2s', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));

          for (let i = 0; i < 10; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(response.status).not.toBe(429);
          }

          await new Promise((resolve) => setTimeout(resolve, 100));

          for (let i = 0; i < 5; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(response.status).not.toBe(429);
          }
        });

        it('UTCID40: Should reject User if they send 10 at 0.1s, 5 at 0.2s, and 5 at 0.3s', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));

          for (let i = 0; i < 10; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(response.status).not.toBe(429);
          }

          await new Promise((resolve) => setTimeout(resolve, 100));

          for (let i = 0; i < 5; i++) {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .send({
                username: validUsername,
                password: validPassword,
              });
            expect(response.status).not.toBe(429);
          }

          await new Promise((resolve) => setTimeout(resolve, 50));

          const response = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .send({
              username: validUsername,
              password: validPassword,
            });
          expect(response.status).toBe(429);
        });
      });
    });

    describe('#FailedValidation', () => {
      beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
          imports: [AuthModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        app.useGlobalPipes(
          new ValidationPipe({
            disableErrorMessages: false,
            whitelist: true,
            transform: true,
            forbidUnknownValues: true,
            forbidNonWhitelisted: true,
            skipMissingProperties: false,
            skipNullProperties: false,
            skipUndefinedProperties: false,
            validationError: {
              target: false,
              value: true,
            },
            exceptionFactory: (errors) => {
              const formattedErrors = errors.map((err) => {
                const constraints = err.constraints ?? {};
                if (constraints.isNotEmpty) {
                  return constraints.isNotEmpty;
                }
                return Object.values(constraints)[0] || 'Validation error';
              });

              return new UnprocessableEntityException(formattedErrors);
            },
          }),
        );

        await app.init();
      });

      afterAll(async () => {
        await app.close();
      });

      describe('#FailedValidation - Field Missing', () => {
        it('UTCID03: Should return 422 when username and password are missing', async () => {
          const response = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('deviceId', '1')
            .send();

          expect(response.status).toBe(422);
          expect(response.body.message).toContain(
            'username: không được bỏ trống',
          );
          expect(response.body.message).toContain(
            'password: không được bỏ trống',
          );
        });

        it('UTCID05: Should return 422 when password is missing', async () => {
          const response = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('deviceId', '1')
            .send({ username: validUsername });

          expect(response.status).toBe(422);
          expect(response.body.message).toContain(
            'password: không được bỏ trống',
          );
        });

        it('UTCID06: Should return 422 when username is missing', async () => {
          const response = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('deviceId', '1')
            .send({ password: validPassword });

          expect(response.status).toBe(422);
          expect(response.body.message).toContain(
            'username: không được bỏ trống',
          );
        });
      });

      describe('#FailedValidation - Null Variable', () => {
        it('UTCID10: Should return 422 with type validation errors when username and password are null', async () => {
          const response = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('deviceId', '1')
            .send({ username: null, password: null });

          expect(response.status).toBe(422);
          expect(response.body.message).toContain(
            'username: không được bỏ trống',
          );
          expect(response.body.message).toContain(
            'password: không được bỏ trống',
          );
        });

        it('UTCID12: Should return 422 when password is null', async () => {
          const response = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('deviceId', '1')
            .send({ username: validUsername, password: null });

          expect(response.status).toBe(422);
          expect(response.body.message).toContain(
            'password: không được bỏ trống',
          );
        });

        it('UTCID13: Should return 422 when username is null', async () => {
          const response = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('deviceId', '1')
            .send({ username: null, password: validPassword });

          expect(response.status).toBe(422);
          expect(response.body.message).toContain(
            'username: không được bỏ trống',
          );
        });
      });

      describe('#FailedValidation - Empty String', () => {
        it('UTCID17: Should return 422 when username and password are empty strings', async () => {
          const response = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('deviceId', '1')
            .send({ username: '', password: '' });

          expect(response.status).toBe(422);
          expect(response.body.message).toContain(
            'username: không được bỏ trống',
          );
          expect(response.body.message).toContain(
            'password: không được bỏ trống',
          );
        });

        it('UTCID18: Should return 422 when username is empty strings', async () => {
          const response = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('deviceId', '1')
            .send({ username: '', password: validPassword });

          expect(response.status).toBe(422);
          expect(response.body.message).toContain(
            'username: không được bỏ trống',
          );
        });

        it('UTCID19: Should return 422 when password is empty strings', async () => {
          const response = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('deviceId', '1')
            .send({ username: validUsername, password: '' });

          expect(response.status).toBe(422);
          expect(response.body.message).toContain(
            'password: không được bỏ trống',
          );
        });
      });

      describe('#FailedValidation - Number 0', () => {
        it('UTCID22: Should return 422 when username is number 0', async () => {
          const response = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('deviceId', '1')
            .send({ username: 0, password: validPassword });

          expect(response.status).toBe(422);
          expect(response.body.message).toContain(
            'username: chỉ được chứa a-z và 0-9',
          );
        });

        it('UTCID23: Should return 422 when password is number 0', async () => {
          const response = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('deviceId', '1')
            .send({ username: validUsername, password: 0 });

          expect(response.status).toBe(422);
          expect(response.body.message).toContain(
            'password: phải tối thiểu 12 kí tự',
          );
        });

        it('UTCID25: Should return 422 when username and password are number 0', async () => {
          const response = await request(app.getHttpServer())
            .post(testLoginEndPoint)
            .set('deviceId', '1')
            .send({ username: 0, password: 0 });

          expect(response.status).toBe(422);
          expect(response.body.message).toContain(
            'username: chỉ được chứa a-z và 0-9',
          );
          expect(response.body.message).toContain(
            'password: phải tối thiểu 12 kí tự',
          );
        });

        describe('#FailedValidation - String 0', () => {
          it('UTCID29: Should not return 422 when username is string "0"', async () => {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('deviceId', '1')
              .send({ username: '0', password: validPassword });

            expect(response.status).not.toBe(422);
          });

          it('UTCID30: Should return 422 when password is string "0"', async () => {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('deviceId', '1')
              .send({ username: validUsername, password: '0' });

            expect(response.status).toBe(422);
            expect(response.body.message).toContain(
              'password: phải tối thiểu 12 kí tự',
            );
          });

          it('UTCID32: Should return 422 when username and password are string "0"', async () => {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('deviceId', '1')
              .send({ username: '0', password: '0' });

            expect(response.status).toBe(422);
            expect(response.body.message).toContain(
              'password: phải tối thiểu 12 kí tự',
            );
          });
        });

        describe('#FailedValidation - Special Characters', () => {
          it('UTCID35: Should return 422 when username contains special characters', async () => {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('deviceId', '1')
              .send({
                username: 'user@!',
                password: validPassword,
              });

            expect(response.status).toBe(422);
            expect(response.body.message).toContain(
              'username: chỉ được chứa a-z và 0-9',
            );
          });

          it('UTCID36: Should not return 422 when password contains special characters', async () => {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('deviceId', '1')
              .send({
                username: validUsername,
                password: 'pass@word#123',
              });

            expect(response.status).not.toBe(422);
          });

          it('UTCID37: Should return 422 when username and password contain special characters', async () => {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('deviceId', '1')
              .send({
                username: 'user@!',
                password: 'pass@word#123',
              });

            expect(response.status).toBe(422);
            expect(response.body.message).toContain(
              'username: chỉ được chứa a-z và 0-9',
            );
          });

          it('UTCID38: Should return 422 when username contains spaces', async () => {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('deviceId', '1')
              .send({
                username: 'test user',
                password: validPassword,
              });

            expect(response.status).toBe(422);
            expect(response.body.message).toContain(
              'username: chỉ được chứa a-z và 0-9',
            );
          });
        });

        describe('#FailedValidation - Length Of Password', () => {
          it('UTCID41: Should return 422 when password is too short', async () => {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('deviceId', '1')
              .send({
                username: validUsername,
                password: 'shortpwd',
              });

            expect(response.status).toBe(422);
            expect(response.body.message).toContain(
              'password: phải tối thiểu 12 kí tự',
            );
          });

          it('UTCID42: Should not return 422 when password is too long', async () => {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('deviceId', '1')
              .send({
                username: validUsername,
                password: '123412341234',
              });

            expect(response.status).not.toBe(422);
          });
        });

        describe('#FailedValidation - Format Constraints', () => {
          it('UTCID43: Should not return 422 when username contains only letters', async () => {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('deviceId', '1')
              .send({
                username: 'abcdef',
                password: validPassword,
              });

            expect(response.status).not.toBe(422);
          });

          it('UTCID44: Should not return 422 when username contains only numbers', async () => {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('deviceId', '1')
              .send({
                username: '123456',
                password: validPassword,
              });

            expect(response.status).not.toBe(422);
          });

          it('UTCID45: Should not return 422 when username contains letters and numbers', async () => {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('deviceId', '1')
              .send({
                username: 'hmd456',
                password: validPassword,
              });

            expect(response.status).not.toBe(422);
          });

          it('UTCID46: Should not return 422 when password contains only letters', async () => {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('deviceId', '1')
              .send({
                username: validUsername,
                password: 'validonlyletters',
              });

            expect(response.status).not.toBe(422);
          });

          it('UTCID47: Should not return 422 when password contains only numbers', async () => {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('deviceId', '1')
              .send({
                username: validUsername,
                password: '123456789012',
              });

            expect(response.status).not.toBe(422);
          });

          it('UTCID48: Should not return 422 when password contains letters and numbers', async () => {
            const response = await request(app.getHttpServer())
              .post(testLoginEndPoint)
              .set('deviceId', '1')
              .send({
                username: validUsername,
                password: 'password1234',
              });

            expect(response.status).not.toBe(422);
          });
        });
      });
    });

    describe('#WrongCredentials', () => {
      let authService;
      let prisma;

      beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          providers: [],
        }).compile();
      });

      it('UTCID00: Should throw UnauthorizedException when username is not found', async () => {
        jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

        const dto = {
          username: USER_NOTFOUND,
          password: invalidPassword,
        };

        await expect(authService.login(dto)).rejects.toThrow(
          UnauthorizedException,
        );
      });

      it('UTCID01: Should throw UnauthorizedException and increment loginAttempts when password is incorrect', async () => {
        const mockUser = {
          id: 1,
          username: validUsername,
          password: await bcrypt.hash(invalidPassword, 10),
          loginAttempts: 0,
        };

        jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

        await expect(
          authService.login({
            username: validUsername,
            password: invalidPassword,
          }),
        ).rejects.toThrow(UnauthorizedException);

        expect(prisma.user.update).toHaveBeenCalledWith({
          where: { id: mockUser.id },
          data: {
            loginAttempts: {
              increment: 1,
            },
            updatedAt: expect.any(Date),
            updatedBy: Buffer.from('system'),
          },
        });
      });

      it('UTCID02: Should return 200 with access_token when correct credentials are provided', async () => {
        const mockUser = {
          id: 1,
          username: validUsername,
          password: await bcrypt.hash(validPassword, 10),
        };

        jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

        const result = await authService.login({
          username: validUsername,
          password: validPassword,
        });

        expect(result.status).toBe(200);
        expect(result.message).toBe('Đăng nhập thành công');
        expect(result.data).toHaveProperty('access_token', 'mocked_jwt_token');
      });
    });
  });
});
