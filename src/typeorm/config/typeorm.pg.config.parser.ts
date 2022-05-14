import { Type as ConstructorType, ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { MinLength, ValidationError } from 'class-validator';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import NodeProcessEnv from '../../config/types/NodeProcessEnv';

// {
//   autoLoadEntities: true,
//   database: envMap.POSTGRES_DB,
//   host: envMap.POSTGRES_HOST,
//   password: envMap.POSTGRES_PASSWORD,
//   port: envMap.POSTGRES_PORT,
//   synchronize: envMap.NODE_ENV === 'test',
//   type: 'postgres',
//   username: envMap.POSTGRES_USER,
// };

export class TypeOrmEnvVars {
  @MinLength(1)
  readonly NODE_ENV: string;

  @MinLength(1)
  readonly POSTGRES_DB: string;

  @MinLength(1)
  readonly POSTGRES_HOST: string;

  @MinLength(1)
  readonly POSTGRES_PASSWORD: string;

  @MinLength(1)
  readonly POSTGRES_PORT: string;

  @MinLength(1)
  readonly POSTGRES_USER: string;
}

export class TypeOrmPgConfig implements PostgresConnectionOptions {
  readonly autoLoadEntities = true;

  readonly database: string;

  readonly host: string;

  readonly password: string;

  readonly port: number;

  readonly synchronize: boolean;

  readonly type = 'postgres';

  readonly username: string;
}

export class TypeOrmPgConfigParser {
  async formatConfig (envVars: TypeOrmEnvVars): Promise<TypeOrmPgConfig> {
    return this.transform({
      database: envVars.POSTGRES_DB
    }, TypeOrmPgConfig, {
      forbidUnknownValues: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
        excludeExtraneousValues: true
      },
    });
  }

  async parse (envMap: NodeProcessEnv): Promise<TypeOrmPgConfig> {
    // Step 1. Read params from envMap:
    const envVars = await this.readEnvVars(envMap);

    // Step 2. Pass values from env vars to config properties
    return this.formatConfig(envVars);
  }

  async readEnvVars (envMap: NodeProcessEnv): Promise<TypeOrmEnvVars> {
    return this.transform(envMap, TypeOrmEnvVars, {
      whitelist: true
    });
  }

  protected async transform<R> (
    value: Record<string, unknown>,
    MetaType: ConstructorType<R>,
    validationPipeOptions: ValidationPipeOptions
  ): Promise<R> {
    const extendedValidationPipeOptions = {
      ...validationPipeOptions,
      exceptionFactory: function (this: ValidationPipe, validationErrors: ValidationError[] = []) {
        const errors = this.flattenValidationErrors(validationErrors).map(error => `  - ${error}`);
        return new Error(`Validation errors:\n${errors.join('\n')}`);
      },
      validateCustomDecorators: true,
    };
    return new ValidationPipe(extendedValidationPipeOptions).transform(value, { type: 'custom', metatype: MetaType });
  }
}

// const configParser = new TypeOrmPgConfigParser();

// export default registerAs<PostgresConnectionOptions>('typeOrmPg', async (envMap: NodeProcessEnv = process.env) => {
//   return configParser.parse(envMap);
// });
