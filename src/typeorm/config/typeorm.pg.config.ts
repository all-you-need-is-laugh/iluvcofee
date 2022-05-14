import { IsBoolean, IsPositive, MinLength } from 'class-validator';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { BindToEnv } from '../../config/decorators/bind-to-env.decorator';
import { FromEnv } from '../../config/decorators/from-env.decorator';
import registerConfig from '../../config/registerConfig';

class TypeOrmPgConfig implements PostgresConnectionOptions {
  readonly autoLoadEntities = true;

  @FromEnv('POSTGRES_DB')
  @BindToEnv(MinLength)(3)
  readonly database: string;

  @FromEnv('POSTGRES_HOST')
  readonly host: string;

  @FromEnv('POSTGRES_PASSWORD')
  readonly password: string;

  @BindToEnv(IsPositive)()
  @FromEnv('POSTGRES_PORT')
  readonly port: number;

  @BindToEnv(IsBoolean)()
  @FromEnv('NODE_ENV', (arg) => arg === 'test')
  readonly synchronize: boolean;

  readonly type = 'postgres';

  @FromEnv('POSTGRES_USER')
  readonly username: string;
}

export default registerConfig('typeOrmPg', TypeOrmPgConfig);
