import { ValidationPipe, UnprocessableEntityException } from '@nestjs/common';

export const validationPipe = new ValidationPipe({
  disableErrorMessages: false,
  whitelist: true,
  transform: true,
  forbidUnknownValues: true,
  forbidNonWhitelisted: true,
  skipMissingProperties: false,
  skipNullProperties: false,
  skipUndefinedProperties: false,
  validationError: {
    target: false,
    value: true,
  },
  exceptionFactory: (errors) => {
    const formattedErrors = errors.map((err) => {
      const constraints = err.constraints ?? {};
      if (constraints.isNotEmpty) {
        return constraints.isNotEmpty;
      }
      return Object.values(constraints)[0] || 'Validation error';
    });

    return new UnprocessableEntityException(formattedErrors);
  },
});
