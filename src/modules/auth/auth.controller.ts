import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';

import { SwaggerTags } from '../../common/constants/enums/swagger-tags.enum';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { loginBodySchema } from './auth.request-schema';

@Controller('auth')
@ApiTags(SwaggerTags.AUTH)
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @ApiBody(loginBodySchema)
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }
}
