import { ThrottlerGuard, ThrottlerStorage } from '@nestjs/throttler';
import type { ThrottlerModuleOptions } from '@nestjs/throttler';

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { LogService } from 'src/log/log.service';
import { Reflector } from '@nestjs/core';
import { AppConfigService } from '../config/appConfigService';
@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  constructor(
    options: ThrottlerModuleOptions,
    storageService: ThrottlerStorage,
    reflector: Reflector,
    private readonly LogService: LogService,
        private readonly appConfigService: AppConfigService,
  ) {
    super(options, storageService, reflector);
  }

  protected async getTracker(req: Request): Promise<string> {
    const ip = req.ip ? req.ip : '127.0.0.1';
    if (req.url == '/api/v2/autenticacion') {
      this.LogService.registarLogIngresoUser(req, ip, this.appConfigService.tokenLocalizacion);
    }
    return ip;
  }
}
