import { Controller, Get, Param, Query } from '@nestjs/common';
import { AsesorService } from './asesor.service';

import { ValidacionIdPipe } from 'src/core-app/utils/validacion-id/validacion-id.pipe';
import { Types } from 'mongoose';
import { ROLE } from 'src/core-app/decorators/appDecorators';
import { RolesE } from 'src/core-app/enum/coreEnum';
import { BuscadorAsesorDto } from './dto/BuscadorAsesor.dto';

@ROLE([RolesE.ADMINISTRADOR])
@Controller('asesor')
export class AsesorController {
  constructor(private readonly asesorService: AsesorService) {}

  @Get('listar')
  listar() {
    return this.asesorService.listar();
  }
  @Get('sucursal/:asesor')
  listarSucursalesAsesores(
    @Param('asesor', ValidacionIdPipe) asesor: Types.ObjectId,
  ) {
    return this.asesorService.listarSucursalesAsesores(asesor);
  }

  @Get('listarPorSucursal')
  listarAesoresPorSucursal(@Query() buscadorAsesorDto:BuscadorAsesorDto) {
    return this.asesorService.listarAsesorPorSucursalDiasTrabajo(
      new Types.ObjectId('679e440036cf4976b7d5a110'),
      buscadorAsesorDto
    );
  }
}
