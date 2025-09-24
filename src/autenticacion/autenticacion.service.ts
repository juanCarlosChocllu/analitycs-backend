import { ForbiddenException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { AutenticacionDto } from './dto/create-autenticacion.dto';
import * as argon2 from 'argon2'
import { UsuarioService } from 'src/usuario/usuario.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AutenticacionService {
  constructor (
    private readonly usuarioService:UsuarioService,
    private readonly jwtService:JwtService

 ){}
 async autenticacion(AutenticacionDto: AutenticacionDto) {
   const usuario = await  this.usuarioService.buscarUsuaurio(AutenticacionDto.username)
   if(usuario){
     const match = await  argon2.verify(usuario.password, AutenticacionDto.password)
     if(match){
      const token = await this.jwtService.signAsync({
       sub: usuario.id,
       id: usuario.id,
      })
      return {
       status:HttpStatus.OK,
       token
      }
     }
     throw new ForbiddenException('Credenciales invalidas')
   }
   throw new ForbiddenException('Credenciales invalidas')
 }

}
