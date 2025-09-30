import { Body, Controller, Post } from "@nestjs/common";
import { VentaLentService } from "../service/ventaLente.service";
import { BuscadorVentaDto } from "../dto/BuscadorVenta.dto";

@Controller('venta')
export class VentaLenteController {
  constructor(
 
    private readonly ventaLentService: VentaLentService,
  ) {}

    @Post('kpi/material')
  kpiMaterial(@Body() kpiDto: BuscadorVentaDto) {
    return this.ventaLentService.kpiMaterial(kpiDto);
  }

}