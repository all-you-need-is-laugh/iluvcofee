import { IsPositive, MinLength } from 'class-validator';

import { BindToEnv } from '../../config/decorators/bind-to-env.decorator';
import { FromEnv } from '../../config/decorators/from-env.decorator';
import registerConfig from '../../config/registerConfig';

class MongooseConfig {
  @FromEnv('MONGO_DB')
  @BindToEnv(MinLength)(3)
  readonly database: string;

  @FromEnv('MONGO_HOST')
  readonly host: string;

  @FromEnv('MONGO_PASSWORD')
  readonly password: string;

  @BindToEnv(IsPositive)()
  @FromEnv('MONGO_PORT')
  readonly port: number;

  @FromEnv('MONGO_USER')
  readonly username: string;
}

export default registerConfig('mongoose', MongooseConfig);
