import { TransformFnParams } from 'class-transformer';
import { getMetadataStorage, ValidationArguments, ValidationOptions } from 'class-validator';
import { ConstraintMetadata } from 'class-validator/types/metadata/ConstraintMetadata';

export const METADATA_ENV_VARS_KEY = Symbol('METADATA_ENV_VARS_KEY');

interface DecoratorGenerator {
  // allow `any` here because we really don't care about type of arguments - in this case arguments can be really any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (...args: any[]): PropertyDecorator
}

export interface SimpleTransform {
  (value: string): TransformFnParams['value']
}

// TODO: [config] Remove this decorator in favor of smarter `exceptionFactory` inside `ConfigPipe`
export function BindToEnv (decoratorGenerator: DecoratorGenerator): DecoratorGenerator {
  const expectedArgLength = decoratorGenerator.length;

  return (...args: unknown[]) => {
    let argToPatch: ValidationOptions | undefined;
    if (args.length >= expectedArgLength) {
      const lastArg = args[args.length - 1];

      if (!lastArg || typeof lastArg !== 'object') {
        argToPatch = {};
        args = [ ...args, argToPatch ];
      } else {
        argToPatch = lastArg;
      }
    } else {
      argToPatch = {};
      args[expectedArgLength - 1] = argToPatch;
    }

    const messageGenerator = (args: ValidationArguments) => {
      const envVarName = Reflect.getMetadata(METADATA_ENV_VARS_KEY, args.object, args.property);

      const validationMetadataStorage = getMetadataStorage();

      const targetMetadatas = validationMetadataStorage.getTargetValidationMetadatas(
        args.object.constructor,
        '',
        false,
        false
      ).filter(({ propertyName, message }) => propertyName === args.property && message === messageGenerator);

      const constraintErrors = [];
      const constraintToErrorMessage = (constraint: ConstraintMetadata): string => {
        const defaultPart = constraint.target.prototype.defaultMessage()
          .replace(/\$property/g, `environment variable "${envVarName}"`);

        return `${defaultPart} (${args.targetName}::${args.property})`;
      };
      for (const metadata of targetMetadatas) {
        const constraints = validationMetadataStorage.getTargetValidatorConstraints(metadata.constraintCls);
        constraintErrors.push(...constraints.map(constraintToErrorMessage));
      }

      return constraintErrors.join('; ');
    };

    argToPatch.message = messageGenerator;

    return decoratorGenerator(...args);
  };
}

