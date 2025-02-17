import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('AuthController', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });
    
    describe('#Login', () => {
        describe('#BurstAndLimit', () => {
            const testLoginEndPoint = '/auth/login';

            describe('#BurstAndLimit - Burst Remains', () => {
                it('UTCID00: Should allow requests below rate limit', async () => {
                    for (let i = 0; i < 4; i++) {
                        const response = await request(app.getHttpServer()).post(
                            testLoginEndPoint,
                        );
                        expect(response.status).toBe(200);
                    }
                });

                it('UTCID01: Should allow requests equal to rate limit', async () => {
                    for (let i = 0; i < 5; i++) {
                        const response = await request(app.getHttpServer()).post(
                            testLoginEndPoint,
                        );
                        expect(response.status).toBe(200);
                    }
                });

                it('UTCID02: Should allow requests exceeding rate limit but within burst limit', async () => {
                    for (let i = 0; i < 6; i++) {
                        const response = await request(app.getHttpServer()).post(
                            testLoginEndPoint,
                        );
                        expect(response.status).toBe(200);
                    }
                });

                it('UTCID03: Should allow requests exceeding rate limit but within burst limit', async () => {
                    for (let i = 0; i < 14; i++) {
                        const response = await request(app.getHttpServer()).post(
                            testLoginEndPoint,
                        );
                        expect(response.status).toBe(200);
                    }
                });

                it('UTCID04: Should allow requests exceeding rate limit but equal to burst limit', async () => {
                    for (let i = 0; i < 15; i++) {
                        const response = await request(app.getHttpServer()).post(
                            testLoginEndPoint,
                        );
                        expect(response.status).toBe(200);
                    }
                });

                it('UTCID05: Should reject requests exceeding burst limit', async () => {
                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer()).post(testLoginEndPoint);
                    }

                    const res = await request(app.getHttpServer()).post(testLoginEndPoint);
                    expect(res.status).toBe(429);
                });
            });

            describe('#BurstAndLimit - Burst Recovery', () => {
                it('UTCID06: Should allow requests below rate limit', async () => {
                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer()).post(testLoginEndPoint);
                    }

                    await new Promise((resolve) => setTimeout(resolve, 1000));

                    for (let i = 0; i < 4; i++) {
                        const response = await request(app.getHttpServer()).post(
                            testLoginEndPoint,
                        );
                        expect(response.status).toBe(200);
                    }
                });

                it('UTCID07: Should allow requests euqal to rate limit', async () => {
                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer()).post(testLoginEndPoint);
                    }

                    await new Promise((resolve) => setTimeout(resolve, 1000));

                    for (let i = 0; i < 5; i++) {
                        const response = await request(app.getHttpServer()).post(
                            testLoginEndPoint,
                        );
                        expect(response.status).toBe(200);
                    }
                });

                it('UTCID08: Should allow requests greater than rate limit', async () => {
                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer()).post(testLoginEndPoint);
                    }

                    await new Promise((resolve) => setTimeout(resolve, 1000));

                    for (let i = 0; i < 6; i++) {
                        const response = await request(app.getHttpServer()).post(
                            testLoginEndPoint,
                        );
                        expect(response.status).toBe(200);
                    }
                });

                it('UTCID09: Should recover burst after 1 second with no requests', async () => {
                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer()).post(testLoginEndPoint);
                    }

                    await new Promise((resolve) => setTimeout(resolve, 1000));

                    for (let i = 0; i < 5; i++) {
                        const response = await request(app.getHttpServer()).post(
                            testLoginEndPoint,
                        );
                        expect(response.status).toBe(200);
                    }
                });

                it('UTCID10: Should fully recover burst after 3 seconds of no requests', async () => {
                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer()).post(testLoginEndPoint);
                    }

                    await new Promise((resolve) => setTimeout(resolve, 3000));

                    for (let i = 0; i < 15; i++) {
                        const response = await request(app.getHttpServer()).post(
                            testLoginEndPoint,
                        );
                        expect(response.status).toBe(200);
                    }
                });

                it('UTCID11: Should fully recover burst after 4 seconds of no requests', async () => {
                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer()).post(testLoginEndPoint);
                    }

                    await new Promise((resolve) => setTimeout(resolve, 3000));

                    for (let i = 0; i < 15; i++) {
                        const response = await request(app.getHttpServer()).post(
                            testLoginEndPoint,
                        );
                        expect(response.status).toBe(200);
                    }

                    const res = await request(app.getHttpServer()).post(testLoginEndPoint);
                    expect(res.status).toBe(429);
                });

                it('UTCID12: Should allow requests below rate limit after 2 seconds recovery', async () => {
                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer()).post(testLoginEndPoint);
                    }

                    await new Promise((resolve) => setTimeout(resolve, 2000));

                    for (let i = 0; i < 9; i++) {
                        const response = await request(app.getHttpServer()).post(
                            testLoginEndPoint,
                        );
                        expect(response.status).toBe(200);
                    }
                });

                it('UTCID13: Should allow requests below rate limit after 2 seconds recovery', async () => {
                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer()).post(testLoginEndPoint);
                    }

                    await new Promise((resolve) => setTimeout(resolve, 2000));

                    for (let i = 0; i < 10; i++) {
                        const response = await request(app.getHttpServer()).post(
                            testLoginEndPoint,
                        );
                        expect(response.status).toBe(200);
                    }
                });

                it('UTCID14: Should reject 11th request after 2 seconds recovery', async () => {
                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer()).post(testLoginEndPoint);
                    }

                    await new Promise((resolve) => setTimeout(resolve, 2000));

                    for (let i = 0; i < 10; i++) {
                        const response = await request(app.getHttpServer()).post(
                            testLoginEndPoint,
                        );
                        expect(response.status).toBe(200);
                    }

                    const res = await request(app.getHttpServer()).post(testLoginEndPoint);
                    expect(res.status).toBe(429);
                });
            });

            describe('#BurstAndLimit - Consecutive User Request - Second User', () => {
                it('UTCID15: Should allow User 2 requests under rate limit', async () => {
                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user1token');
                    }

                    await request(app.getHttpServer())
                        .post(testLoginEndPoint)
                        .set('Authorization', 'Bearer user1token')

                        .expect(429);

                    await request(app.getHttpServer())
                        .post(testLoginEndPoint)
                        .set('Authorization', 'Bearer user2token')

                        .expect(200);
                });

                it('UTCID16: Should allow User 2 requests equal to rate limit', async () => {
                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user1token');
                    }

                    await request(app.getHttpServer())
                        .post(testLoginEndPoint)
                        .set('Authorization', 'Bearer user1token')

                        .expect(429);

                    for (let i = 0; i < 5; i++) {
                        const response = await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user2token');
                        expect(response.status).toBe(200);
                    }
                });

                it('UTCID17: Should allow User 2 requests greater than rate limit', async () => {
                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user1token');
                    }

                    await request(app.getHttpServer())
                        .post(testLoginEndPoint)
                        .set('Authorization', 'Bearer user1token')

                        .expect(429);

                    for (let i = 0; i < 6; i++) {
                        const response = await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user2token');
                        expect(response.status).toBe(200);
                    }
                });

                it('UTCID18: Should allow User 2 requests under burst', async () => {
                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user1token');
                    }

                    await request(app.getHttpServer())
                        .post(testLoginEndPoint)
                        .set('Authorization', 'Bearer user1token')

                        .expect(429);

                    for (let i = 0; i < 14; i++) {
                        const response = await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user2token');
                        expect(response.status).toBe(200);
                    }
                });

                it('UTCID19: Should allow User 2 requests equal to rate limit', async () => {
                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user1token');
                    }

                    await request(app.getHttpServer())
                        .post(testLoginEndPoint)
                        .set('Authorization', 'Bearer user1token')

                        .expect(429);

                    for (let i = 0; i < 15; i++) {
                        const response = await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user2token');
                        expect(response.status).toBe(200);
                    }
                });

                it('UTCID20: Should allow User 2 requests greater than rate limit', async () => {
                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user1token');
                    }

                    await request(app.getHttpServer())
                        .post(testLoginEndPoint)
                        .set('Authorization', 'Bearer user1token')

                        .expect(429);

                    for (let i = 0; i < 15; i++) {
                        const response = await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user2token');
                        expect(response.status).toBe(200);
                    }

                    const response = await request(app.getHttpServer())
                        .post(testLoginEndPoint)
                        .set('Authorization', 'Bearer user2token');
                    expect(response.status).toBe(429);
                });
            });

            describe('#BurstAndLimit - Consecutive User Request - Second User - Burst Recovery', () => {
                it('UTCID21: Should allow User 2 requests under rate limit', async () => {
                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user1token');
                    }

                    await request(app.getHttpServer())
                        .post(testLoginEndPoint)
                        .set('Authorization', 'Bearer user1token')

                        .expect(429);

                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer())
                            .set('Authorization', 'Bearer user2token')
                            .post(testLoginEndPoint);
                    }

                    await new Promise((resolve) => setTimeout(resolve, 1000));

                    await request(app.getHttpServer())
                        .post(testLoginEndPoint)
                        .set('Authorization', 'Bearer user2token')

                        .expect(200);
                });

                it('UTCID22: Should allow User 2 requests under rate limit', async () => {
                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user1token');
                    }

                    await request(app.getHttpServer())
                        .post(testLoginEndPoint)
                        .set('Authorization', 'Bearer user1token')

                        .expect(429);

                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user2token');
                    }

                    await new Promise((resolve) => setTimeout(resolve, 1000));

                    for (let i = 0; i < 5; i++) {
                        const response = await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user2token');
                        expect(response.status).toBe(200);
                    }
                });

                it('UTCID23: Should allow User 2 requests greater than rate limit', async () => {
                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user1token');
                    }

                    await request(app.getHttpServer())
                        .post(testLoginEndPoint)
                        .set('Authorization', 'Bearer user1token')

                        .expect(429);

                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user2token');
                    }

                    await new Promise((resolve) => setTimeout(resolve, 1000));

                    for (let i = 0; i < 6; i++) {
                        const response = await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user2token');
                        expect(response.status).toBe(200);
                    }
                });

                it('UTCID24: Should allow User 2 to send request after 1 second', async () => {
                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user1token');
                    }

                    await request(app.getHttpServer())
                        .post(testLoginEndPoint)
                        .set('Authorization', 'Bearer user1token')

                        .expect(429);

                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user2token');
                    }

                    const response = await request(app.getHttpServer())
                        .post(testLoginEndPoint)
                        .set('Authorization', 'Bearer user2token');
                    expect(response.status).toBe(429);

                    await new Promise((resolve) => setTimeout(resolve, 1000));

                    for (let i = 0; i < 5; i++) {
                        const response = await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user2token');
                        expect(response.status).toBe(200);
                    }
                });

                it('UTCID25: Should allow User 2 to send request after 3 seconds', async () => {
                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user1token');
                    }

                    await request(app.getHttpServer())
                        .post(testLoginEndPoint)
                        .set('Authorization', 'Bearer user1token')

                        .expect(429);

                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user2token');
                    }

                    const response = await request(app.getHttpServer())
                        .post(testLoginEndPoint)
                        .set('Authorization', 'Bearer user2token');
                    expect(response.status).toBe(429);

                    await new Promise((resolve) => setTimeout(resolve, 3000));

                    for (let i = 0; i < 15; i++) {
                        const response = await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user2token');
                        expect(response.status).toBe(200);
                    }
                });

                it('UTCID26: Should allow User 2 to send request after 4 seconds', async () => {
                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user1token');
                    }

                    await request(app.getHttpServer())
                        .post(testLoginEndPoint)
                        .set('Authorization', 'Bearer user1token')

                        .expect(429);

                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user2token');
                    }

                    const firstResponse = await request(app.getHttpServer())
                        .post(testLoginEndPoint)
                        .set('Authorization', 'Bearer user2token');
                    expect(firstResponse.status).toBe(429);

                    await new Promise((resolve) => setTimeout(resolve, 4000));

                    for (let i = 0; i < 15; i++) {
                        const response = await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user2token');
                        expect(response.status).toBe(200);
                    }

                    const secondResponse = await request(app.getHttpServer())
                        .post(testLoginEndPoint)
                        .set('Authorization', 'Bearer user2token');
                    expect(secondResponse.status).toBe(429);
                });

                it('UTCID27: Should allow User 2 to send request after 2 second', async () => {
                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user1token');
                    }

                    await request(app.getHttpServer())
                        .post(testLoginEndPoint)
                        .set('Authorization', 'Bearer user1token')

                        .expect(429);

                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user2token');
                    }

                    const firstResponse = await request(app.getHttpServer())
                        .post(testLoginEndPoint)
                        .set('Authorization', 'Bearer user2token');
                    expect(firstResponse.status).toBe(429);

                    await new Promise((resolve) => setTimeout(resolve, 2000));

                    for (let i = 0; i < 9; i++) {
                        const response = await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user2token');
                        expect(response.status).toBe(200);
                    }
                });

                it('UTCID28: Should allow User 2 to send request after 2 second', async () => {
                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user1token');
                    }

                    await request(app.getHttpServer())
                        .post(testLoginEndPoint)
                        .set('Authorization', 'Bearer user1token')

                        .expect(429);

                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user2token');
                    }

                    const firstResponse = await request(app.getHttpServer())
                        .post(testLoginEndPoint)
                        .set('Authorization', 'Bearer user2token');
                    expect(firstResponse.status).toBe(429);

                    await new Promise((resolve) => setTimeout(resolve, 2000));

                    for (let i = 0; i < 10; i++) {
                        const response = await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user2token');
                        expect(response.status).toBe(200);
                    }
                });

                it('UTCID29: Should allow User 2 to send request after 2 second', async () => {
                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user1token');
                    }

                    await request(app.getHttpServer())
                        .set('Authorization', 'Bearer user1token')
                        .post(testLoginEndPoint)
                        .expect(429);

                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user2token');
                    }

                    const firstResponse = await request(app.getHttpServer())
                        .post(testLoginEndPoint)
                        .set('Authorization', 'Bearer user2token');
                    expect(firstResponse.status).toBe(429);

                    await new Promise((resolve) => setTimeout(resolve, 2000));

                    for (let i = 0; i < 10; i++) {
                        const response = await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user2token');
                        expect(response.status).toBe(200);
                    }

                    const response = await request(app.getHttpServer())
                        .post(testLoginEndPoint)
                        .set('Authorization', 'Bearer user2token');
                    expect(response.status).toBe(429);
                });
            });

            describe('#BurstAndLimit - Concurrency', () => {
                it('UTCID30: Should allow User 1 & User 2 to send 4 requests concurrently', async () => {
                    const user1Requests = Array(4).fill(
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user1token'),
                    );
                    const user2Requests = Array(4).fill(
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user2token'),
                    );

                    const responses = await Promise.all([...user1Requests, ...user2Requests]);

                    responses.forEach(response => {
                        expect(response.status).toBe(200);
                    });
                });

                it('UTCID31: Should allow User 1 & User 2 to send 5 requests concurrently', async () => {
                    const user1Requests = Array(5).fill(
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user1token'),
                    );
                    const user2Requests = Array(5).fill(
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user2token'),
                    );

                    const responses = await Promise.all([...user1Requests, ...user2Requests]);

                    responses.forEach(response => {
                        expect(response.status).toBe(200);
                    });
                });

                it('UTCID32: Should reject User 1 & User 2 to send 6 requests concurrently', async () => {
                    const user1Requests = Array(6).fill(
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user1token'),
                    );
                    const user2Requests = Array(6).fill(
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user2token'),
                    );

                    const responses = await Promise.all([...user1Requests, ...user2Requests]);

                    responses.forEach(response => {
                        expect(response.status).toBe(200);
                    });
                });

                it('UTCID33: Should allow User 1 & User 2 to send 14 requests concurrently', async () => {
                    const user1Requests = Array(14).fill(
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user1token'),
                    );
                    const user2Requests = Array(14).fill(
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user2token'),
                    );

                    const responses = await Promise.all([...user1Requests, ...user2Requests]);

                    responses.forEach(response => {
                        expect(response.status).toBe(200);
                    });
                });

                it('UTCID34: Should allow User 1 & User 2 to send 15 requests concurrently', async () => {
                    const user1Requests = Array(15).fill(
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user1token'),
                    );
                    const user2Requests = Array(15).fill(
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user2token'),
                    );

                    const responses = await Promise.all([...user1Requests, ...user2Requests]);

                    responses.forEach(response => {
                        expect(response.status).toBe(200);
                    });
                });

                it('UTCID35: Should reject User 1 & User 2 to send 16 requests concurrently', async () => {
                    const user1Requests = Array(16).fill(
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user1token'),
                    );
                    const user2Requests = Array(16).fill(
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user2token'),
                    );

                    const responses = await Promise.all([...user1Requests, ...user2Requests]);

                    responses.forEach(response => {
                        expect(response.status).toBe(200);
                    });
                });

                it('UTCID36: Should reject if User 1 sends 15 requests and User 2 sends 16 requests concurrently', async () => {
                    const user1Requests = Array(15).fill(
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user1token'),
                    );
                    const user2Requests = Array(16).fill(
                        await request(app.getHttpServer())
                            .post(testLoginEndPoint)
                            .set('Authorization', 'Bearer user2token'),
                    );

                    const responses1 = await Promise.all(user1Requests)
                    const responses2 = await Promise.all(user2Requests)

                    responses1.forEach(response => {
                        expect(response.status).toBe(200);
                    });

                    responses2.forEach(response => {
                        expect(response.status).toBe(429);
                    });
                });
            });

            describe('#BurstAndLimit - Burst Reset In Miliseconds', () => {
                it('UTCID37: Should allow 1 requests if sent within 0.4s after being blocked', async () => {
                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer()).post(testLoginEndPoint);
                    }

                    await new Promise((resolve) => setTimeout(resolve, 400));

                    const response = await request(app.getHttpServer()).post(
                        testLoginEndPoint,
                    );
                    expect(response.status).toBe(200);
                });

                it('UTCID38: Should allow 2 requests but reject 3rd request if sent within 0.4s after being blocked', async () => {
                    for (let i = 0; i < 15; i++) {
                        await request(app.getHttpServer()).post(testLoginEndPoint);
                    }

                    await new Promise((resolve) => setTimeout(resolve, 400));

                    for (let i = 0; i < 2; i++) {
                        const response = await request(app.getHttpServer()).post(
                            testLoginEndPoint,
                        );
                        expect(response.status).toBe(200);
                    }

                    const response = await request(app.getHttpServer()).post(
                        testLoginEndPoint,
                    );
                    expect(response.status).toBe(429);
                });
            });

            describe('#BurstAndLimit - Request Consecutively In Miliseconds', () => {
                it('UTCID39: Should reject User if they send 10 at 0.1s, 5 at 0.2s', async () => {
                    await new Promise((resolve) => setTimeout(resolve, 100));

                    for (let i = 0; i < 10; i++) {
                        const response = await request(app.getHttpServer()).post(
                            testLoginEndPoint,
                        );
                        expect(response.status).toBe(200);
                    }

                    await new Promise((resolve) => setTimeout(resolve, 100));

                    for (let i = 0; i < 5; i++) {
                        const response = await request(app.getHttpServer()).post(
                            testLoginEndPoint,
                        );
                        expect(response.status).toBe(200);
                    }
                });

                it('UTCID40: Should reject User if they send 10 at 0.1s, 5 at 0.2s, and 5 at 0.3s', async () => {
                    await new Promise((resolve) => setTimeout(resolve, 100));

                    for (let i = 0; i < 10; i++) {
                        const response = await request(app.getHttpServer()).post(
                            testLoginEndPoint,
                        );
                        expect(response.status).toBe(200);
                    }

                    await new Promise((resolve) => setTimeout(resolve, 100));

                    for (let i = 0; i < 5; i++) {
                        const response = await request(app.getHttpServer()).post(
                            testLoginEndPoint,
                        );
                        expect(response.status).toBe(200);
                    }

                    await new Promise((resolve) => setTimeout(resolve, 100));

                    const response = await request(app.getHttpServer()).post(
                        testLoginEndPoint,
                    );
                    expect(response.status).toBe(429);
                });
            });
        });
    });
});
