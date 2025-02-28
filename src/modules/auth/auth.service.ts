import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AuthDto } from './dto/auth.dto';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { getCurrentDate } from '../../helpers';
import { JwtPayload } from '../../common/constants/types/jwt-payload.type';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Handles user login and returns JWT token.
   * @param {AuthDto} dto - The authentication data transfer object.
   * @returns {Promise<object>} JWT access token.
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
      data: { access_token },
    };
  }

  /**
   * Validates user credentials.
   * @param {string} username - The username of the user.
   * @param {string} password - The password provided by the user.
   * @returns {Promise<User>} The authenticated user object.
   * @throws {UnauthorizedException} If credentials are incorrect.
   */
  private async validateUser(username: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });

    if (!user || !(this.verifyPassword(password, user.password))) {
      await this.handleFailedLogin(user as User);
      throw new UnauthorizedException('Sai thông tin đăng nhập');
    }

    return user;
  }

  /**
   * Handles failed login attempts.
   * @param {User} user - The user attempting to log in.
   */
  private async handleFailedLogin(user?: User): Promise<void> {
    if (user) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: { increment: 1 },
          updatedAt: getCurrentDate(),
          updatedBy: Buffer.from('system'),
        },
      });
    }
  }

  /**
   * Generates a signed JWT token for the user.
   * @param {JwtPayload} payload - The payload containing user details.
   * @returns {Promise<string>} The signed JWT access token.
   */
  private signToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  /**
   * Compares a password with its hashed version.
   * @param {string} password - The raw password.
   * @param {string} hashedPassword - The hashed password stored in the database.
   * @returns {Promise<boolean>} Whether the password matches.
   */
  private verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
