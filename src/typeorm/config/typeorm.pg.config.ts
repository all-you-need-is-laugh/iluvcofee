import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export default registerAs('typeOrmPg', () => {
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

  return postgresConfig;
});
