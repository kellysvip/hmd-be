import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UnprocessableEntityException,
  UsePipes,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';

import { SwaggerTags } from '../../common/constants/enums/swagger-tags.enum';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { loginBodySchema } from './auth.request-schema';
import { validationPipe } from '../../validation-pipe';

@Controller('auth')
@ApiTags(SwaggerTags.AUTH)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBody(loginBodySchema)
  @UsePipes(validationPipe)
  @HttpCode(HttpStatus.OK)
  async login(@Headers('deviceId') deviceId: string, @Body() dto: AuthDto) {
    const numericDeviceId = Number(deviceId);

    if (isNaN(numericDeviceId)) {
      throw new UnprocessableEntityException('deviceId must be a number');
    }

    return this.authService.login(numericDeviceId, dto);
  }
}
