import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AnyExceptionFilter } from '../common/filters/any-exception.filter';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';

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

  app.useGlobalFilters(new AnyExceptionFilter(), new HttpExceptionFilter());

  return app;
}

export default setupApp;
