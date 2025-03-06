import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { Logger } from '@nestjs/common';

import { config } from '../config';

@Injectable()
export class TokenBucketMiddleware implements NestMiddleware {
  private redis: Redis;
  private readonly logger = new Logger(TokenBucketMiddleware.name);
  private readonly BUCKET_CAPACITY = config.REDIS.BUCKET_CAPACITY;
  private readonly REFILL_RATE = config.REDIS.REFILL_RATE;
  private readonly HOST = config.REDIS.HOST;
  private readonly PORT = config.REDIS.PORT;

  constructor() {
    this.redis = this.initializeRedis();
  }

  private initializeRedis(): Redis {
    const redis = new Redis({
      host: this.HOST,
      port: this.PORT,
      retryStrategy: (times) => (times > 5 ? null : times * 50),
      maxRetriesPerRequest: null,
      connectTimeout: 10000,
    });

    redis.on('connect', () => this.logger.log('Redis connected'));
    redis.on('ready', () => this.logger.log('Redis ready'));
    redis.on('error', (err) =>
      this.logger.error(`Redis error: ${err.message}`),
    );
    redis.on('reconnecting', (time) =>
      this.logger.warn(`Redis reconnecting in ${time}ms...`),
    );

    return redis;
  }
  async use(req: Request, _: Response, next: NextFunction) {
    try {
      const userIP = this.getUserIP(req);
      const now = Math.floor(Date.now() / 1000);

      const [currentTokensKey, lastRefillKey] = this.getRedisKeys(userIP);
      const updatedTokens = await this.getTokens(
        currentTokensKey,
        lastRefillKey,
        now,
      );

      await this.setCurrentTokens(updatedTokens, currentTokensKey, next);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.throwRateLimitError();
    }
  }

  private getUserIP(req: Request): string {
    const userIP =
      req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.ip;
    if (!userIP) throw new BadRequestException('IP Address is required');

    return userIP;
  }

  private getRedisKeys(userIP: string): [string, string] {
    return [`token_bucket:${userIP}`, `token_bucket:${userIP}:last_refill`];
  }

  private async getTokens(
    key: string,
    lastRefillKey: string,
    now: number,
  ): Promise<number> {
    const lastRefill = await this.getLastRefillTime(lastRefillKey, now);
    const currentTokens = await this.getCurrentTokens(key);

    const updatedTokens = this.calculateUpdatedTokens(
      currentTokens,
      lastRefill,
      now,
    );

    await this.redis.set(lastRefillKey, now.toString(), 'EX', 60);

    return updatedTokens;
  }

  private async getLastRefillTime(
    lastRefillKey: string,
    now: number,
  ): Promise<number> {
    const lastRefillRaw = await this.redis.get(lastRefillKey);

    return lastRefillRaw ? parseInt(lastRefillRaw, 10) : now;
  }

  private async getCurrentTokens(currentTokensKey: string): Promise<number> {
    const currentTokensRaw = await this.redis.get(currentTokensKey);

    return currentTokensRaw
      ? parseInt(currentTokensRaw, 10)
      : this.BUCKET_CAPACITY;
  }

  private calculateUpdatedTokens(
    currentTokens: number,
    lastRefill: number,
    now: number,
  ): number {
    const elapsedTime = now - lastRefill;
    const tokensToAdd = elapsedTime * this.REFILL_RATE;

    return Math.min(this.BUCKET_CAPACITY, currentTokens + tokensToAdd);
  }

  private async setCurrentTokens(
    updatedTokens: number,
    currentTokensKey: string,
    next: NextFunction,
  ) {
    if (updatedTokens > 0) {
      await this.redis.set(
        currentTokensKey,
        (updatedTokens - 1).toString(),
        'EX',
        60,
      );
      return next();
    }

    this.throwRateLimitError();
  }

  private throwRateLimitError() {
    throw new HttpException(
      {
        message: 'Vui lòng thử lại sau 30 giây',
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
