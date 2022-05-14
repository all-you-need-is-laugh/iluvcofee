import { DynamicModule } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
// eslint-disable-next-line no-restricted-syntax -- allow TypeOrmModule only here
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedConfigModule } from '../config/shared-config.module';
import typeOrmPgConfig from './config/typeorm.pg.config';

export class SharedTypeOrmModule {
  static forFeature (...args: Parameters<typeof TypeOrmModule.forFeature>): DynamicModule {
    const typeOrmImports = TypeOrmModule.forFeature(...args);
    return typeOrmImports;
  }

  static forRoot (): DynamicModule {
    const typeOrmImports = TypeOrmModule.forRootAsync({
      imports: [ SharedConfigModule.forFeature(typeOrmPgConfig) ],
      inject: [ typeOrmPgConfig.KEY ],
      useFactory: (config: ConfigType<typeof typeOrmPgConfig>) => config
    });

    return {
      module: TypeOrmModule,
      imports: [ typeOrmImports ],
      exports: [ TypeOrmModule ]
    };
  }
}
