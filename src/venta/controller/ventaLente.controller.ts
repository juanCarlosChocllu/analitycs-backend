import { Controller, Post, Body } from "@nestjs/common";
import { VentaLentService } from "../service/ventaLente.service";
import { BuscadorVentaLenteDto } from "../dto/BuscadorVentaLente.dto";

@Controller('venta')
export class VentaLenteController {
  constructor(
 
    private readonly ventaLentService: VentaLentService,
  ) {}
  @Post('kpi/empresas/lentes')
  kpiLentes(@Body() kpiEmpresaDto: BuscadorVentaLenteDto) {
    console.log('hola');
    
    return this.ventaLentService.kpiEmpresas(kpiEmpresaDto);
  }
}