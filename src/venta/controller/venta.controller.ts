import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { VentaService } from '../service/venta.service';
import { BuscadorRendimientoDiarioDto } from 'src/rendimiento-diario/dto/BuscardorRendimientoDiario';
import { VentaRendimientoDiarioService } from '../service/ventaRendimientoDiario.service';
import { BuscadorVentaDto } from '../dto/BuscadorVenta.dto';
import { ROLE } from 'src/core-app/decorators/appDecorators';
import { RolesE } from 'src/core-app/enum/coreEnum';

@ROLE([RolesE.ADMINISTRADOR])
@Controller('venta')
export class VentaController {
  constructor(
    private readonly ventaService: VentaService,
    private readonly ventaRendimientoDiarioService: VentaRendimientoDiarioService,
  ) {}

  @Post('metas/porAsesor')
  async ventaMentaPorAsesor(
    @Body() BuscadorRendimientoDiarioDto: BuscadorRendimientoDiarioDto,
  ) {
    return this.ventaRendimientoDiarioService.ventaMentaPorAsesor(
      BuscadorRendimientoDiarioDto,
    );
  }
  @Post('avance/local')
  avanceLocal(
    @Body() BuscadorRendimientoDiarioDto: BuscadorRendimientoDiarioDto,
  ) {
    return this.ventaRendimientoDiarioService.avanceLocal(
      BuscadorRendimientoDiarioDto,
    );
  }
  @Post('excel/indicadores/sucursal')
  async indicadoresPorSucursal(@Body() ventaTodasDto: BuscadorVentaDto) {
    return this.ventaService.indicadoresPorSucursal(ventaTodasDto);
  }
  @Post('excel/indicadores/asesor')
  async indicadoresPorAsesor(@Body() ventaTodasDto: BuscadorVentaDto) {
    return await this.ventaService.indicadoresPorAsesor(ventaTodasDto);
  }

  @Post('actual')
  async ventaExcelActual(@Body() ventaTodasDto: BuscadorVentaDto) {
    return await this.ventaService.ventas(ventaTodasDto);
  }

  @Post('anterior')
  async ventaExcelAnterior(@Body() ventaTodasDto: BuscadorVentaDto) {
    return await this.ventaService.ventas(ventaTodasDto);
  }
}
