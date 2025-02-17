import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SwaggerTags } from '../../common/constants/enums/swagger-tags.enum';

@Controller('auth')
@ApiTags(SwaggerTags.AUTH)
export class AuthController {

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: Request, @Body() dto) {}
}
