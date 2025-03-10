export const config = {
  PROJECT_NAME: process.env.PROJECT_NAME || 'svc-gateway-api',
  LOG_LEVEL: process.env.LOG_LEVEL || 'fatal',
  PORT: parseInt(process.env.PORT || '3030'),
  JWT: {
    SECRET: process.env.JWT_SECRET || 'jwt_secret',
    EXPIRATION: process.env.JWT_EXPIRATION || '3h',
  },
  REDIS: {
    REFILL_RATE: parseInt(process.env.REFILL_RATE || '5'),
    BUCKET_CAPACITY: parseInt(process.env.BUCKET_CAPACITY || '15'),
    HOST: process.env.HOST || '127.0.0.1',
    PORT: parseInt(process.env.REDIS_PORT || '6379'),
  },
};
