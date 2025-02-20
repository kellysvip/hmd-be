import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SwaggerTags } from '../../common/constants/enums/swagger-tags.enum';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
@ApiTags(SwaggerTags.AUTH)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Headers('deviceId') deviceId: Request, @Body() dto: AuthDto) {
    return this.authService.login(Number(deviceId), dto);
  }
}
