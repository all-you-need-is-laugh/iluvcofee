import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import appConfig from '../../app/app.config';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor (
    private readonly reflector: Reflector,
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>
  ) {}

  canActivate (context: ExecutionContext): boolean {
    const isPublic = this.reflector.get(IS_PUBLIC_KEY, context.getHandler());

    if (isPublic) { return true; }

    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    const requestApiKey = /^Bearer (.+)$/.exec(authHeader || '')?.[1] || '';

    return this.config.apiKey === requestApiKey;
  }
}
