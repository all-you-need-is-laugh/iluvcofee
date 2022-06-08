import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Paramtype,
  PipeTransform,
  ValidationError,
  ValidationPipe
} from '@nestjs/common';
import PQueue from 'p-queue';

const PARAM_TYPE_TO_FIELD_NAME: Record<Paramtype | 'default', string> = {
  body: 'body field ',
  custom: '',
  default: '',
  param: 'parameter ',
  query: 'query field ',
};

@Injectable()
export class SmartValidationPipe extends ValidationPipe implements PipeTransform {
  private originalTransformingValue: unknown = null;
  private transformationQueue: PQueue = new PQueue({ concurrency: 1 });
  private paramType: Paramtype | null;

  constructor () {
    super({
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      stopAtFirstError: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      },
      whitelist: true,
    });
  }

  override createExceptionFactory (): (errors?: ValidationError[]) => BadRequestException {
    return (validationErrors = []) => {
      const [ firstError ] = validationErrors;

      if (firstError === undefined) {
        return new InternalServerErrorException(`SmartValidationPipe.createExceptionFactory called without errors`);
      }

      const fieldName = PARAM_TYPE_TO_FIELD_NAME[this.paramType || 'default'];
      const [ firstErrorMessage ] = this.flattenValidationErrors([ firstError ]);

      if (firstErrorMessage === undefined) {
        return new InternalServerErrorException(`SmartValidationPipe.createExceptionFactory flatten errors are empty`);
      }

      const passedValue = (this.originalTransformingValue as Record<string, unknown>)[firstError.property];
      const errorMessage = firstErrorMessage
        .replace(firstError.property, `"${firstError.property}"`)
        .replace(/^property /, '')
        .replace(/^(each value in )?/, `$1${fieldName}`);

      return new BadRequestException(`${errorMessage} (passed value: ${JSON.stringify(passedValue)})`);
    };
  }

  override async transform (value: unknown, metadata: ArgumentMetadata): Promise<unknown> {
    return this.transformationQueue.add(async () => {
      try {
        this.originalTransformingValue = value;
        this.paramType = metadata.type;
        // return + await for executing `finally` branch after async transformation
        return await super.transform(value, metadata);
      } finally {
        // just clear stored values
        this.originalTransformingValue = this.paramType = null;
      }
    });
  }
}
