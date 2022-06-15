import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs'; // eslint-disable-line import/no-unresolved -- FIXME

import { ResponsePayload } from '../entities/response-payload.entity';

@Injectable()
export class WrapResponseInterceptor implements NestInterceptor {
  intercept (context: ExecutionContext, next: CallHandler): Observable<ResponsePayload> {
    return next.handle()
      .pipe(
        map(data => ResponsePayload.Succeeded(data))
      );
  }
}
