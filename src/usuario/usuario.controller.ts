import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

import { Types } from 'mongoose';
import type { Request } from 'express';
import { ValidacionIdPipe } from 'src/core-app/utils/validacion-id/validacion-id.pipe';
import { ResetearContrasena } from './dto/resetar-contrasena.dto';
import { RolGuard } from 'src/core-app/guards/Rol.Guard';
import { ROLE } from 'src/core-app/decorators/appDecorators';
import { RolesE } from 'src/core-app/enum/coreEnum';

@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}
  @ROLE([RolesE.ADMINISTRADOR])
  @Post('create')
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }
  @ROLE([RolesE.ADMINISTRADOR, RolesE.ASESOR, RolesE.GESTOR])
  @Get('perfil')
  perfil(@Req() request: Request) {
    return this.usuarioService.perfil(request.usuario.idUsuario);
  }
  @ROLE([RolesE.ADMINISTRADOR])
  @Get('listar')
  listarusuarios() {
    return this.usuarioService.listarusuarios();
  }
  @ROLE([RolesE.ADMINISTRADOR])
  @Get('asesor')
  listarusuariosAsesor() {
    return this.usuarioService.listarusuariosAsesor();
  }
  @ROLE([RolesE.ADMINISTRADOR])
  @Get(':id')
  findOne(@Param('id', ValidacionIdPipe) id: Types.ObjectId) {
    return this.usuarioService.findOne(id);
  }
  
  @ROLE([RolesE.ADMINISTRADOR])
  @Patch(':id')
  actualizar(
    @Param('id', ValidacionIdPipe) id: Types.ObjectId,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuarioService.actualizar(id, updateUsuarioDto);
  }
  @ROLE([RolesE.ADMINISTRADOR])
  @Delete(':id')
  softDelete(@Param('id', ValidacionIdPipe) id: Types.ObjectId) {
    return this.usuarioService.softDelete(id);
  }
  @ROLE([RolesE.ADMINISTRADOR])
  @Get('asignar/sucursal/:detalleAsesor/:usuario')
  asignarSucursalAusuario(
    //@Req() request: Request,
    @Param('detalleAsesor', ValidacionIdPipe) detalleAsesor: Types.ObjectId,
    @Param('usuario', ValidacionIdPipe) usuario: Types.ObjectId,
  ) {
    return this.usuarioService.asignarSucursalAusuario(detalleAsesor, usuario);
  }

  @ROLE([RolesE.ADMINISTRADOR, RolesE.ASESOR, RolesE.GESTOR])
  @Get('verificar/rol')
  verificarRol(@Req() request: Request) {
    return this.usuarioService.verificarRol(request);
  }
  @ROLE([RolesE.ADMINISTRADOR, RolesE.ASESOR, RolesE.GESTOR])
  @Post('resetear/contrasena/:id')
  resetarContrasenaUsuario(
    @Body() resetearContrasena: ResetearContrasena,
    @Param('id', ValidacionIdPipe) id: Types.ObjectId,
  ) {
    return this.usuarioService.resetarContrasenaUsuario(resetearContrasena, id);
  }
}
