
import { Controller, Post, Body } from "@nestjs/common";
import { VentaLentService } from "../service/ventaLente.service";
import { BuscadorVentaLenteDto } from "../dto/BuscadorVentaLente.dto";

import { Body, Controller, Post } from "@nestjs/common";
import { VentaLentService } from "../service/ventaLente.service";
import { BuscadorVentaDto } from "../dto/BuscadorVenta.dto";


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


    @Post('kpi/material')
  kpiMaterial(@Body() kpiDto: BuscadorVentaDto) {
    return this.ventaLentService.kpiMaterial(kpiDto);
  }


}