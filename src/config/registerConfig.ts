import { ArgumentMetadata, Type, ValidationError, ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { ConfigFactory, ConfigFactoryKeyHost, ConfigObject, registerAs } from '@nestjs/config';
import NodeProcessEnv from './types/NodeProcessEnv';

export class ConfigPipe<T> extends ValidationPipe {
  private Constructor: Type<T>;

  constructor (Constructor: Type<T>, options?: ValidationPipeOptions) {
    const mergedOptions: Partial<ValidationPipeOptions> = {
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const errors = this.flattenValidationErrors(validationErrors).map(error => `  - ${error}`);
        return new Error(`Validation errors:\n${errors.join('\n')}`);
      },
      forbidUnknownValues: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
        excludeExtraneousValues: true
      },
      validateCustomDecorators: true,
    };

    super(options ? { ...mergedOptions, ...options } : mergedOptions);

    this.Constructor = Constructor;
  }

  override async transform (value: unknown, metadata?: ArgumentMetadata): Promise<T> {
    return super.transform(value, metadata || { type: 'custom', metatype: this.Constructor });
  }
}

type RegisterConfigReturn<T> = ConfigFactory<T> & ConfigFactoryKeyHost<ReturnType<ConfigFactory<T>>>;

function registerConfig<T extends ConfigObject> (token: string, Constructor: Type<T>): RegisterConfigReturn<T> {
  // TODO: have only one instance of the `configPipe`
  const configPipe = new ConfigPipe(Constructor);

  const configFactory: ConfigFactory<T> = async (envMap: NodeProcessEnv = process.env) => {
    // TODO: make `configPipe.transform` synchronous
    const config = await configPipe.transform(envMap);

    return config;
  };

  return registerAs(token, configFactory);
}

export default registerConfig;
