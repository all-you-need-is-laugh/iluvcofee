import { applyDecorators } from '@nestjs/common';
import { Expose, Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

import { BindToEnv, METADATA_ENV_VARS_KEY, SimpleTransform } from './bind-to-env.decorator';

// FIXME: [config] supports only 1 property depending on the same env var
export function FromEnv (envVarName: string, transform?: SimpleTransform): PropertyDecorator {
  return applyDecorators(
    Expose({ name: envVarName }),
    ...(transform ? [ Transform(({ obj }) => transform(obj[envVarName])) ] : []),
    BindToEnv(IsNotEmpty)(),
    Reflect.metadata(METADATA_ENV_VARS_KEY, envVarName)
  );
}
