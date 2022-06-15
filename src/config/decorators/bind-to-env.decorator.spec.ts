import { IsPositive } from 'class-validator';

import { checkRejection } from '../../../test/utils/checkRejection';
import { ConfigPipe } from '../registerConfig';
import { BindToEnv } from './bind-to-env.decorator';
import { FromEnv } from './from-env.decorator';

describe('@BindToEnv', () => {
  it('should replace property name with environment variable name inside validation error', async () => {
    class ConfigSchemaRegular {
      @IsPositive()
      port: number;
    }

    const configPipeRegular = new ConfigPipe(ConfigSchemaRegular);

    const errorMessageRegular = [
      'Validation errors:',
      '  - port must be a positive number'
    ].join('\n');

    await checkRejection(() => configPipeRegular.transform({}), errorMessageRegular);

    class ConfigSchemaBoundToEnv {
      @FromEnv('APP_PORT')
      @BindToEnv(IsPositive)()
      port: number;
    }

    const configPipeBoundToEnv = new ConfigPipe(ConfigSchemaBoundToEnv);

    const errorMessageBoundToEnv = [
      'Validation errors:',
      '  - environment variable "APP_PORT" must be a positive number (ConfigSchemaBoundToEnv::port)'
    ].join('\n');

    await checkRejection(() => configPipeBoundToEnv.transform({ APP_PORT: -1 }), errorMessageBoundToEnv);
  });
});
