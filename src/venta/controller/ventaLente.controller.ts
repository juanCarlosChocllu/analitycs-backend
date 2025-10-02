import { Controller, Post, Body, Param } from '@nestjs/common';
import { VentaLentService } from '../service/ventaLente.service';
import { BuscadorVentaLenteDto } from '../dto/BuscadorVentaLente.dto';
import { BuscadorVentaDto } from '../dto/BuscadorVenta.dto';
import { ValidacionIdPipe } from 'src/core-app/utils/validacion-id/validacion-id.pipe';
import { Types } from 'mongoose';
import { DetalleVentaDto } from '../dto/DetalleVenta.dto';
import { ROLE } from 'src/core-app/decorators/appDecorators';
import { RolesE } from 'src/core-app/enum/coreEnum';


@ROLE([RolesE.ADMINISTRADOR])
@Controller('venta')
export class VentaLenteController {
  constructor(private readonly ventaLentService: VentaLentService) {}

  @Post('kpi/empresas/lentes')
  kpiLentes(@Body() kpiEmpresaDto: BuscadorVentaLenteDto) {
    return this.ventaLentService.kpiEmpresas(kpiEmpresaDto);
  }

  @Post('kpi/material')
  kpiMaterial(@Body() kpiDto: BuscadorVentaDto) {
    return this.ventaLentService.kpiMaterial(kpiDto);
  }

  @Post('kpi/informacion/:sucursal')
  kpiInformacion(
    @Param('sucursal', new ValidacionIdPipe()) sucursal: Types.ObjectId,
    @Body() informacionVentaDto: DetalleVentaDto,
  ) {
    return this.ventaLentService.kpiInformacion(sucursal, informacionVentaDto);
  }
  

}
