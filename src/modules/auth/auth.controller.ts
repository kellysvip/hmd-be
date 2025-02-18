import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SwaggerTags } from '../../common/constants/enums/swagger-tags.enum';

@Controller('auth')
@ApiTags(SwaggerTags.AUTH)
export class AuthController {}
