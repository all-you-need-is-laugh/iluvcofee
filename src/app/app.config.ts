import { MinLength } from 'class-validator';

import { BindToEnv } from '../config/decorators/bind-to-env.decorator';
import { FromEnv } from '../config/decorators/from-env.decorator';
import registerConfig from '../config/registerConfig';

class AppConfig {
  @FromEnv('SERVER_API_KEY')
  @BindToEnv(MinLength)(10)
  apiKey: string;
}

export default registerConfig('app', AppConfig);
