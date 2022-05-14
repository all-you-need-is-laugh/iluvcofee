import { DynamicModule } from '@nestjs/common';
// eslint-disable-next-line no-restricted-syntax -- allow TypeOrmModule only here
import { TypeOrmModule } from '@nestjs/typeorm';

export class SharedTypeOrmModule {
  static forFeature (...args: Parameters<typeof TypeOrmModule.forFeature>): DynamicModule {
    const typeOrmImports = TypeOrmModule.forFeature(...args);
    return typeOrmImports;
  }

  static forRoot (): DynamicModule {
    const typeOrmImports = TypeOrmModule.forRoot({
      autoLoadEntities: true,
      database: 'iluvcofee',
      host: 'localhost',
      password: 'postgres',
      port: process.env.NODE_ENV === 'test' ? 5442 : 5432,
      synchronize: process.env.NODE_ENV === 'test', // use migrations for schema synchronization
      type: 'postgres',
      username: 'postgres',
    });

    return {
      module: TypeOrmModule,
      imports: [ typeOrmImports ],
      exports: [ TypeOrmModule ]
    };
  }
}
