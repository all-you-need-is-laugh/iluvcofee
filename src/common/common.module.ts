import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import appConfig from '../app/app.config';
import { SharedConfigModule } from '../config/shared-config.module';
import { ApiKeyGuard } from './guards/api-key.guard';

@Module({
  imports: [ SharedConfigModule.forFeature(appConfig) ],
  providers: [ { provide: APP_GUARD, useClass: ApiKeyGuard } ]
})
export class CommonModule {}
