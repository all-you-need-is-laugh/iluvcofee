import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import setupApp from './setupApp';

async function bootstrap () {
  const app = await NestFactory.create(AppModule);

  setupApp(app);

  // FIXME: [config] read port from app config
  await app.listen(3000);
}

bootstrap();
