import { INestApplication } from '@nestjs/common';
import { AnyExceptionFilter } from '../common/filters/any-exception.filter';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { WrapResponseInterceptor } from '../common/interceptors/wrap-response.interceptor';
import { SmartValidationPipe } from '../common/pipes/smart-validation.pipe';

function setupApp (app: INestApplication): INestApplication {
  app.useGlobalPipes(new SmartValidationPipe());
  app.useGlobalFilters(new AnyExceptionFilter(), new HttpExceptionFilter());
  app.useGlobalInterceptors(new WrapResponseInterceptor());

  return app;
}

export default setupApp;
