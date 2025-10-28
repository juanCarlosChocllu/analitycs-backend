import {
  Controller,
  Post,
  Body,
  
  Req,
} from '@nestjs/common';
import { VentaService } from '../service/venta.service';
import { BuscadorRendimientoDiarioDto } from 'src/rendimiento-diario/dto/BuscardorRendimientoDiario';
import { VentaRendimientoDiarioService } from '../service/ventaRendimientoDiario.service';
import { BuscadorVentaDto } from '../dto/BuscadorVenta.dto';
import { ROLE } from 'src/core-app/decorators/appDecorators';
import { RolesE } from 'src/core-app/enum/coreEnum';
import type {Request} from 'express'

@Controller('venta')
export class VentaController {
  constructor(
    private readonly ventaService: VentaService,
    private readonly ventaRendimientoDiarioService: VentaRendimientoDiarioService,
  ) {}
  @ROLE([RolesE.ADMINISTRADOR, RolesE.ASESOR, RolesE.GESTOR])
  @Post('metas/porAsesor')
  async ventaMentaPorAsesor(
    @Body() BuscadorRendimientoDiarioDto: BuscadorRendimientoDiarioDto,
  ) {
    return this.ventaRendimientoDiarioService.ventaMentaPorAsesor(
      BuscadorRendimientoDiarioDto,
 
    );
  }
  @ROLE([RolesE.ADMINISTRADOR, RolesE.ASESOR, RolesE.GESTOR])
  @Post('avance/local')
  avanceLocal(
    @Body() BuscadorRendimientoDiarioDto: BuscadorRendimientoDiarioDto,
  ) {
    return this.ventaRendimientoDiarioService.avanceLocal(
      BuscadorRendimientoDiarioDto,
    );
  }
  @ROLE([RolesE.ADMINISTRADOR])
  @Post('excel/indicadores/sucursal')
  async indicadoresPorSucursal(@Body() ventaTodasDto: BuscadorVentaDto) {
    return this.ventaService.indicadoresPorSucursal(ventaTodasDto);
  }
  @ROLE([RolesE.ADMINISTRADOR])
  @Post('excel/indicadores/asesor')
  async indicadoresPorAsesor(@Body() ventaTodasDto: BuscadorVentaDto) {
    return await this.ventaService.indicadoresPorAsesor(ventaTodasDto);
  }
  @ROLE([RolesE.ADMINISTRADOR])
  @Post('actual')
  async ventaExcelActual(@Body() ventaTodasDto: BuscadorVentaDto) {
    return await this.ventaService.ventas(ventaTodasDto);
  }
  @ROLE([RolesE.ADMINISTRADOR])
  @Post('anterior')
  async ventaExcelAnterior(@Body() ventaTodasDto: BuscadorVentaDto) {
    return await this.ventaService.ventas(ventaTodasDto);
  }
}
