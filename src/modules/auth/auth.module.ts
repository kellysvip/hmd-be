import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { config } from '../../config';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async () => {
        const options: JwtModuleOptions = {
          secret: config.JWT.SECRET,
          signOptions: {
            expiresIn: config.JWT.EXPIRATION,
            issuer: config.PROJECT_NAME,
            algorithm: 'HS256',
          },
        };
        return options;
      },
    }),
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
