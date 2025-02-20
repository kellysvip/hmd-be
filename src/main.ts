import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
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
    }),
  );

  const docConfig = new DocumentBuilder()
    .setTitle('HMD API Documentation')
    .setDescription('Play with the API')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http' }, 'user')
    .build();

  const document = SwaggerModule.createDocument(app, docConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
