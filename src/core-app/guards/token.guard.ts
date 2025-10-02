import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';


import { Request } from 'express';
import { UsuarioService } from 'src/usuario/usuario.service';
import { jwtConstants } from 'src/core-app/Constants/jwtConstants';
import { PUBLIC_KEY } from 'src/core-app/decorators/keys';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly usuariosService: UsuarioService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const publico = this.reflector.get(PUBLIC_KEY, context.getHandler());
    if (publico) {
      return true;
    }
    const request: Request = context.switchToHttp().getRequest();
    try {
      const token: string = request.cookies['ctx'];  
      if (token) {
        const tokenVerificada = await this.jwtService.verify(token, {
          secret: jwtConstants.secret,
        });

        const usuario = await this.usuariosService.buscarUsuarioPorId(
          tokenVerificada.id,
        ); 
        if (usuario) {
          request.usuario = {
            detalleAsesor: usuario.detalleAsesor ? usuario.detalleAsesor : null,
            idUsuario: usuario?.id,
            rol:usuario.rol
          };
          return true;
        }
        return false;
      }
      return false;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
