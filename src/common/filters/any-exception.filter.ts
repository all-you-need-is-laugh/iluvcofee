import { ArgumentsHost, Catch, ExceptionFilter, InternalServerErrorException } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

@Catch()
export class AnyExceptionFilter<T extends Error> implements ExceptionFilter {
  private httpExceptionFilter = new HttpExceptionFilter();

  catch (exception: T, host: ArgumentsHost): void {
    const message = exception.message || String(exception);
    this.httpExceptionFilter.catch(new InternalServerErrorException(message), host);
  }
}
