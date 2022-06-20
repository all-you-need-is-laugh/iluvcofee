import { DynamicModule } from '@nestjs/common';
// eslint-disable-next-line no-restricted-syntax -- allow ConfigModule only here
import { ConfigFactory, ConfigModule } from '@nestjs/config';

export const SKIP_PARAMETER = '<skip>';

export class SharedConfigModule {
  static forFeature (config: ConfigFactory): DynamicModule {
    return ConfigModule.forFeature(config);
  }

  static forRoot (): DynamicModule {
    return {
      module: ConfigModule,
      imports: [
        ConfigModule.forRoot({
          ignoreEnvFile: process.env.NODE_ENV === 'production',
          envFilePath: `.env.${process.env.NODE_ENV || 'development'}`
        })
      ],
      exports: [ ConfigModule ]
    };
  }
}
