import { Body, Controller, Post } from "@nestjs/common";
import { VentaProductoService } from "../service/ventaProducto.service";
import { BuscadorVentaDto } from "../dto/BuscadorVenta.dto";

@Controller('venta/producto')
export class VentaProductoController {
  constructor(private readonly ventaProductoService: VentaProductoService) {}

  
  @Post('reporte/actual')
  reporteProductosActual(@Body() buscadorVentaDto:BuscadorVentaDto){
    return this.ventaProductoService.reporteVentaProductosUnidad(buscadorVentaDto, true)
  }
    
  @Post('reporte/anterior')
  reporteProductosAnterior(@Body() buscadorVentaDto:BuscadorVentaDto){
    return this.ventaProductoService.reporteVentaProductosUnidad(buscadorVentaDto, false)
  }
}
