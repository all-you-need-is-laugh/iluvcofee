import { applyDecorators } from '@nestjs/common';
import { Expose, Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

import { BindToEnv, METADATA_ENV_VARS_KEY } from './bind-to-env.decorator';

interface SimpleTransform {
  (value: string): TransformFnParams['value']
}

// FIXME: [config] supports only 1 property depending on the same env var
export function FromEnv (envVarName: string, transform?: SimpleTransform): PropertyDecorator {
  return applyDecorators(
    Expose({ name: envVarName }),
    ...(transform ? [ Transform(({ obj }) => transform(obj[envVarName])) ] : []),
    BindToEnv(IsNotEmpty)(),
    Reflect.metadata(METADATA_ENV_VARS_KEY, envVarName)
  );
}
