import { checkRejection } from '../../../test/utils/checkRejection';
import UnorderedTuple from '../../../test/utils/types/UnorderedTuple';
import NodeProcessEnv from '../../config/types/NodeProcessEnv';
import { TypeOrmEnvVars, TypeOrmPgConfig, TypeOrmPgConfigParser } from './typeorm.pg.config.parser';

describe('TypeOrmPgConfigParser', () => {
  let configParser: TypeOrmPgConfigParser;

  beforeAll(async () => {
    configParser = new TypeOrmPgConfigParser();
  });

  describe('readEnvVars', () => {
    const processEnvVars: NodeProcessEnv = {
      NODE_ENV: 'test',
      POSTGRES_DB: 'iluvcofee',
      POSTGRES_HOST: 'localhost',
      POSTGRES_PASSWORD: 'postgres',
      POSTGRES_PORT: '5442',
      POSTGRES_USER: 'postgres',
      UNUSED_ENV_VAR: 'unused_env_var'
    };

    const processEnvVarsProperties: UnorderedTuple<keyof TypeOrmEnvVars> = [
      'NODE_ENV',
      'POSTGRES_DB',
      'POSTGRES_HOST',
      'POSTGRES_PASSWORD',
      'POSTGRES_PORT',
      'POSTGRES_USER',
    ];

    it('should read all specified env vars', async () => {
      const envVars = await configParser.readEnvVars(processEnvVars);

      expect(envVars).toBeObject();
      expect(envVars.NODE_ENV).toEqual('test');
      expect(envVars.POSTGRES_DB).toEqual('iluvcofee');
      expect(envVars.POSTGRES_HOST).toEqual('localhost');
      expect(envVars.POSTGRES_PASSWORD).toEqual('postgres');
      expect(envVars.POSTGRES_PORT).toEqual('5442');
      expect(envVars.POSTGRES_USER).toEqual('postgres');
    });

    it('should not read any unused env vars', async () => {
      const envVars = await configParser.readEnvVars(processEnvVars);

      expect(Object.keys(envVars)).toHaveLength(6);
      expect('UNUSED_ENV_VAR' in envVars).toBeFalse();
    });

    const describeNoValueCases = (property: keyof TypeOrmEnvVars) => {
      describe(`failures when detected wrong value - ${property}`, () => {
        it('should fail if env var is not specified', async () => {
          const { [property]: ignoredProperty, ...processEnvVarsWithoutUser } = processEnvVars;
          const errorMessage = [
            'Validation errors:',
            `  - ${property} must be longer than or equal to 1 characters`
          ].join('\n');

          await checkRejection(() => configParser.readEnvVars(processEnvVarsWithoutUser), errorMessage);
        });

        it('should fail if any of requested env vars has empty value (undefined)', async () => {
          const processEnvVarsWithUserUndefined = { ...processEnvVars, [property]: undefined };
          const errorMessage = [
            'Validation errors:',
            `  - ${property} must be longer than or equal to 1 characters`
          ].join('\n');

          await checkRejection(() => configParser.readEnvVars(processEnvVarsWithUserUndefined), errorMessage);
        });

        it('should fail if any of requested env vars has empty value (empty string)', async () => {
          const processEnvVarsWithUserEmptyString = { ...processEnvVars, [property]: '' };
          const errorMessage = [
            'Validation errors:',
            `  - ${property} must be longer than or equal to 1 characters`
          ].join('\n');

          await checkRejection(() => configParser.readEnvVars(processEnvVarsWithUserEmptyString), errorMessage);
        });
      });
    };

    for (const envVarProperty of processEnvVarsProperties) {
      describeNoValueCases(envVarProperty);
    }
  });

  describe('formatConfig', () => {
    const parsedEnvVars: TypeOrmEnvVars = {
      NODE_ENV: 'test',
      POSTGRES_DB: 'iluvcofee',
      POSTGRES_HOST: 'localhost',
      POSTGRES_PASSWORD: 'postgres',
      POSTGRES_PORT: '5442',
      POSTGRES_USER: 'postgres',
    };

    const configProperties: UnorderedTuple<keyof TypeOrmPgConfig> = [
      'autoLoadEntities',
      'database',
      'host',
      'password',
      'port',
      'synchronize',
      'type',
      'username',
    ];
    console.log('### > describe > configProperties', configProperties);

    it.todo('should format all config properties'/* , async () => {
      const typeOrmConfig = await configParser.formatConfig(parsedEnvVars);
      console.log('### > it > typeOrmConfig', typeOrmConfig);

      expect(typeOrmConfig).toBeObject();
      // expect(typeOrmConfig.NODE_ENV).toEqual('test');
      // expect(typeOrmConfig.POSTGRES_DB).toEqual('iluvcofee');
      // expect(typeOrmConfig.POSTGRES_HOST).toEqual('localhost');
      // expect(typeOrmConfig.POSTGRES_PASSWORD).toEqual('postgres');
      // expect(typeOrmConfig.POSTGRES_PORT).toEqual('5442');
      // expect(typeOrmConfig.POSTGRES_USER).toEqual('postgres');
    } */);

    // it('should not read any unused env vars', async () => {
    //   const envVars = await configParser.formatConfig(processEnvVars);

    //   expect(Object.keys(envVars)).toHaveLength(6);
    //   expect('UNUSED_ENV_VAR' in envVars).toBeFalse();
    // });

    // const describeNoValueCases = (property: keyof TypeOrmEnvVars) => {
    //   describe(`failures when detected wrong value - ${property}`, () => {
    //     it('should fail if env var is not specified', async () => {
    //       const { [property]: ignoredProperty, ...processEnvVarsWithoutUser } = processEnvVars;
    //       const errorMessage = [
    //         'Validation errors:',
    //         `  - ${property} must be longer than or equal to 1 characters`
    //       ].join('\n');

    //       await checkRejection(() => configParser.formatConfig(processEnvVarsWithoutUser), errorMessage);
    //     });

    //     it('should fail if any of requested env vars has empty value (undefined)', async () => {
    //       const processEnvVarsWithUserUndefined = { ...processEnvVars, [property]: undefined };
    //       const errorMessage = [
    //         'Validation errors:',
    //         `  - ${property} must be longer than or equal to 1 characters`
    //       ].join('\n');

    //       await checkRejection(() => configParser.formatConfig(processEnvVarsWithUserUndefined), errorMessage);
    //     });

    //     it('should fail if any of requested env vars has empty value (empty string)', async () => {
    //       const processEnvVarsWithUserEmptyString = { ...processEnvVars, [property]: '' };
    //       const errorMessage = [
    //         'Validation errors:',
    //         `  - ${property} must be longer than or equal to 1 characters`
    //       ].join('\n');

    //       await checkRejection(() => configParser.formatConfig(processEnvVarsWithUserEmptyString), errorMessage);
    //     });
    //   });
    // };

    // for (const envVarProperty of processEnvVarsProperties) {
    //   describeNoValueCases(envVarProperty);
    // }
  });

});
