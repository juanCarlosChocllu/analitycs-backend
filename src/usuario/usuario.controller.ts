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

@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post("create")
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  @Get("listar")
  listarusuarios() {
    return this.usuarioService.listarusuarios();
  }
  @Get('asesor')
  listarusuariosAsesor() {
    return this.usuarioService.listarusuariosAsesor();
  }

  @Get(':id')
  findOne(@Param('id', ValidacionIdPipe) id: Types.ObjectId) {
    return this.usuarioService.findOne(id);
  }

   @Patch(':id')
  actualizar(
    @Param('id', ValidacionIdPipe) id: Types.ObjectId,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuarioService.actualizar(id, updateUsuarioDto);
  }

  @Delete(':id')
  softDelete(@Param('id', ValidacionIdPipe) id: Types.ObjectId) {
    return this.usuarioService.softDelete(id);
  }

  @Get('asignar/sucursal/:detalleAsesor/:usuario')
  asignarSucursalAusuario(
    //@Req() request: Request,
    @Param('detalleAsesor', ValidacionIdPipe) detalleAsesor: Types.ObjectId,
    @Param('usuario', ValidacionIdPipe) usuario: Types.ObjectId,
  ) {
    return this.usuarioService.asignarSucursalAusuario(detalleAsesor, usuario);
  }

  @Get('verificar/rol')
  verificarRol(@Req() request: Request) {
    return this.usuarioService.verificarRol(request);
  }
}
