import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

function setupApp (app: INestApplication): INestApplication {
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      },
      whitelist: true,
    }),
  );

  app.useGlobalGuards(new ApiKeyGuard());

  return app;
}

export default setupApp;
