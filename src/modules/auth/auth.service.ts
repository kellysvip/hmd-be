import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AuthDto } from './dto/auth.dto';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { getCurrentDate } from '../../helpers';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Verify if user is logged in
   * Return the jwt token if yes
   *
   * @param {string} username - username of user
   * @param {string} password - password
   *
   * @return {Promise<object>} the object contains jwt token
   */
  async login(_, dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: dto.username,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Sai thông tin đăng nhập');
    }

    const pwMatches = await this.verifyPassword(dto.password, user.password);
    if (!pwMatches) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: {
            increment: 1,
          },
          updatedAt: getCurrentDate(),
          updatedBy: Buffer.from('system'),
        },
      });

      throw new UnauthorizedException('Sai thông tin đăng nhập');
    }

    return {
      status: 200,
      message: 'Đăng nhập thành công',
      data: {
        access_token: await this.signToken(user.id, user.username),
      },
    };
  }

  /**
   * Generates a signed JWT token for the specified user.
   * @param userId - The unique identifier of the user.
   * @param username - The username of the user.
   * @returns A promise that resolves to an object containing the access token.
   * @throws Will throw an error if token signing fails.
   */
  async signToken(userId: number, username: string): Promise<string> {
    return this.jwtService.signAsync({ id: userId, username });
  }

  /**
   * Return the comparation between password and hash
   *
   * @param {string} password         - password of user
   * @param {string} hashedPassword   - hashed password in database
   *
   * @return {Promise<boolean>} is password correct
   */
  private async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
