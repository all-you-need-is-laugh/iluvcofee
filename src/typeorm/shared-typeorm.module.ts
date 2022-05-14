import { DynamicModule } from '@nestjs/common';
// eslint-disable-next-line no-restricted-syntax -- allow TypeOrmModule only here
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class SharedTypeOrmModule {
  static forFeature (...args: Parameters<typeof TypeOrmModule.forFeature>): DynamicModule {
    const typeOrmImports = TypeOrmModule.forFeature(...args);
    return typeOrmImports;
  }

  static forRoot (): DynamicModule {
    const postgresConfig: PostgresConnectionOptions & TypeOrmModuleOptions = {
      autoLoadEntities: true,
      database: String(process.env.POSTGRES_DB),
      host: String(process.env.POSTGRES_HOST),
      password: String(process.env.POSTGRES_PASSWORD),
      port: Number(process.env.POSTGRES_PORT),
      synchronize: process.env.NODE_ENV === 'test', // use migrations for schema synchronization
      type: 'postgres',
      username: String(process.env.POSTGRES_USER),
    };
    const typeOrmImports = TypeOrmModule.forRoot(postgresConfig);

    return {
      module: TypeOrmModule,
      imports: [ typeOrmImports ],
      exports: [ TypeOrmModule ]
    };
  }
}
