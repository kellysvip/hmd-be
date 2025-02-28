import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

import { config } from '../config';

@Injectable()
export class TokenBucketMiddleware implements NestMiddleware {
  private redis: Redis;
  private readonly BUCKET_CAPACITY = config.REDIS.BUCKET_CAPACITY;
  private readonly REFILL_RATE = config.REDIS.REFILL_RATE;

  constructor() {
    this.redis = new Redis({
      host: '127.0.0.1',
      port: 6379,
      retryStrategy: (times) => (times > 5 ? null : Math.min(times * 50, 2000)),
      maxRetriesPerRequest: 5,
      connectTimeout: 10000,
    });

    this.redis.on('error', (err) => console.error('Redis Error:', err));
  }

  async use(req: Request, _: Response, next: NextFunction) {
    const userIP =
      req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      req.ip ||
      'anonymous';
    const key = `token_bucket:${userIP}`;
    const lastRefillKey = `token_bucket:${userIP}:last_refill`;

    const now = Math.floor(Date.now() / 1000);

    try {
      const lastRefillRaw = await this.redis.get(lastRefillKey);
      const lastRefill = lastRefillRaw ? parseInt(lastRefillRaw, 10) : now;

      const currentTokensRaw = await this.redis.get(key);
      const currentTokens = currentTokensRaw
        ? parseInt(currentTokensRaw, 10)
        : this.BUCKET_CAPACITY;

      const elapsedTime = now - lastRefill;
      const tokensToAdd = elapsedTime * this.REFILL_RATE;
      const updatedTokens = Math.min(
        this.BUCKET_CAPACITY,
        currentTokens + tokensToAdd,
      );

      await this.redis.set(lastRefillKey, now.toString());

      if (updatedTokens > 0) {
        await this.redis.set(key, (updatedTokens - 1).toString());
        return next();
      }

      throw new HttpException(
        {
          message: 'Vui lòng thử lại sau 30 giây',
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          message: 'Vui lòng thử lại sau 30 giây',
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
