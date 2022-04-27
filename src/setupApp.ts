import { INestApplication, ValidationPipe } from '@nestjs/common';

function setupApp (app: INestApplication): INestApplication {
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );

  return app;
}

export default setupApp;
