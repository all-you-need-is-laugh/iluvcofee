import { DynamicModule } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
// eslint-disable-next-line no-restricted-syntax -- allow MongooseModule only here
import { MongooseModule } from '@nestjs/mongoose';

import { SharedConfigModule, SKIP_PARAMETER } from '../config/shared-config.module';
import mongooseConfig from './config/mongoose.config';

export class SharedMongooseModule {
  static forFeature (...args: Parameters<typeof MongooseModule.forFeature>): DynamicModule {
    const mongooseImports = MongooseModule.forFeature(...args);
    return mongooseImports;
  }

  static forRoot (): DynamicModule {
    const mongooseImports = MongooseModule.forRootAsync({
      imports: [ SharedConfigModule.forFeature(mongooseConfig) ],
      inject: [ mongooseConfig.KEY ],
      useFactory: (config: ConfigType<typeof mongooseConfig>) => {
        const authParams = [];
        if (config.username !== SKIP_PARAMETER) {
          authParams.push(config.username);
        }
        if (config.password !== SKIP_PARAMETER) {
          authParams.push(config.password);
        }

        const authString = authParams.length ? `${authParams.join(':')}@` : '';

        return {
          uri: `mongodb://${authString}${config.host}:${config.port}/${config.database}`
        };
      }
    });

    return {
      module: MongooseModule,
      imports: [ mongooseImports ],
      exports: [ MongooseModule ]
    };
  }
}
