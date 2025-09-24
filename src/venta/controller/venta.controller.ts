import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VentaService } from '../service/venta.service';
import { BuscadorRendimientoDiarioDto } from 'src/rendimiento-diario/dto/BuscardorRendimientoDiario';
import { VentaRendimientoDiarioService } from '../service/ventaRendimientoDiario.service';

@Controller('venta')
export class VentaController {
  constructor(private readonly ventaService: VentaService,
    private readonly ventaRendimientoDiarioService: VentaRendimientoDiarioService
  ) {}



    @Post('metas/porAsesor')
  async ventaMentaPorAsesor(
    @Body() BuscadorRendimientoDiarioDto: BuscadorRendimientoDiarioDto,
  ) {   
    return this.ventaRendimientoDiarioService.ventaMentaPorAsesor(BuscadorRendimientoDiarioDto);
  }
    @Post('avance/local')
   avanceLocal(
    @Body() BuscadorRendimientoDiarioDto: BuscadorRendimientoDiarioDto,
  ) {
    return this.ventaRendimientoDiarioService.avanceLocal(BuscadorRendimientoDiarioDto);
  }
}
