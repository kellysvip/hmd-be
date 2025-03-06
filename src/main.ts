import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import { join } from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  const sslPath = join(process.cwd(), 'ssl');
  const httpsOptions = {
    key: fs.readFileSync(join(sslPath, 'server.key')),
    cert: fs.readFileSync(join(sslPath, 'server.pem')),
  };

  const app = await NestFactory.create(AppModule, { httpsOptions });

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
