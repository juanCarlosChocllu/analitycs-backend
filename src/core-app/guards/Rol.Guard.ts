import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { log } from 'node:console';
import { Observable } from 'rxjs';

import { Request } from 'express';
import { UsuarioService } from 'src/usuario/usuario.service';
import { jwtConstants } from 'src/core-app/Constants/jwtConstants';
import { PUBLIC_KEY, ROLES_KEY } from 'src/core-app/decorators/keys';
import { RolesE } from '../enum/coreEnum';

@Injectable()
export class RolGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  async canActivate(context: ExecutionContext) {
    const publico = this.reflector.get(PUBLIC_KEY, context.getHandler());
    if (publico) {
      return true;
    }
    const request: Request = context.switchToHttp().getRequest();

    if (request && request.usuario.rol) {
      const requiredRoles = this.reflector.getAllAndOverride<RolesE[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );
      console.log(requiredRoles);
      
      //return requiredRoles.some((rol)=> request.usuario.rol == rol)
    }
    //falta termianar los roles 
    return true;
  }
}
