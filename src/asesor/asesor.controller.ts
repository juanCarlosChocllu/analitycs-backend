import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { AsesorService } from './asesor.service';

import { ValidacionIdPipe } from 'src/core-app/utils/validacion-id/validacion-id.pipe';
import { Types } from 'mongoose';
import { ROLE } from 'src/core-app/decorators/appDecorators';
import { RolesE } from 'src/core-app/enum/coreEnum';
import { BuscadorAsesorDto } from './dto/BuscadorAsesor.dto';
import type { Request } from 'express';

@Controller('asesor')
export class AsesorController {
  constructor(private readonly asesorService: AsesorService) { }
  @ROLE([RolesE.ADMINISTRADOR])
  @Get('listar')
  listar() {
    return this.asesorService.listar();
  }
  @ROLE([RolesE.ADMINISTRADOR])
  @Get('sucursal/:asesor')
  listarSucursalesAsesores(
    @Param('asesor', ValidacionIdPipe) asesor: Types.ObjectId,
  ) {
    return this.asesorService.listarSucursalesAsesores(asesor);
  }
  @ROLE([RolesE.ADMINISTRADOR, RolesE.GESTOR])
  @Get('listarPorSucursal')
  listarAesoresPorSucursal(
    @Query() buscadorAsesorDto: BuscadorAsesorDto,
    @Req() request: Request,
  ) {
    return this.asesorService.listarAsesorPorSucursalDiasTrabajo(
      request.usuario.detalleAsesor,
      buscadorAsesorDto,
    );
  }

  @ROLE([RolesE.ADMINISTRADOR, RolesE.GESTOR, RolesE.ASESOR])
  @Get('montrarScursalUsuario')
  mostrarSucursalUsuario(@Req() request: Request,){
    return this.asesorService.mostrarSucursalUsuario(request.usuario.detalleAsesor)
  }
}
