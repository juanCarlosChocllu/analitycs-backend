import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Request } from 'express';

import {
  PUBLIC_KEY,
  PUBLICP_INTERNO_KEY,
  ROLES_KEY,
} from 'src/core-app/decorators/keys';
import { RolesE } from '../enum/coreEnum';

@Injectable()
export class RolGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  async canActivate(context: ExecutionContext) {
    const publico = this.reflector.get(PUBLIC_KEY, context.getHandler());
    if (publico) {
      return true;
    }

    const publicoInterno = this.reflector.get(
      PUBLICP_INTERNO_KEY,
      context.getHandler(),
    );
    if (publicoInterno) {
      return true;
    }
    const request: Request = context.switchToHttp().getRequest();

    if (request && request.usuario.rol) {
      const requiredRoles = this.reflector.getAllAndOverride<RolesE[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );
      return requiredRoles.some((rol)=> request.usuario.rol == rol)
    }
   
    throw new UnauthorizedException()
  }
}
