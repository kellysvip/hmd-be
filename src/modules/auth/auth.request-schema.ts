import { ApiBodyOptions } from '@nestjs/swagger';

export const loginBodySchema: ApiBodyOptions = {
  schema: {
    type: 'object',
    properties: {
      username: {
        type: 'string',
        description: 'Username of the user',
        example: 'johndoe',
      },
      password: {
        type: 'string',
        description: 'Password of the user',
        example: 'securePassword123',
      },
    },
  },
};
