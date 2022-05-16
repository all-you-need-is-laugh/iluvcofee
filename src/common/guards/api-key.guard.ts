import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import appConfig from '../../app/app.config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  async canActivate (context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    const requestApiKey = /^Bearer (.+)$/.exec(authHeader || '')?.[1] || '';

    // FIXME: [config] pass `appConfig` as dependency
    const { apiKey: configApiKey } = await appConfig();

    return configApiKey === requestApiKey;
  }
}
