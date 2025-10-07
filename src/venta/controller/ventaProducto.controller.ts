import { Body, Controller, Param, Post } from "@nestjs/common";
import { VentaProductoService } from "../service/ventaProducto.service";
import { BuscadorVentaDto } from "../dto/BuscadorVenta.dto";
import { ROLE } from "src/core-app/decorators/appDecorators";
import { RolesE } from "src/core-app/enum/coreEnum";
import { DetalleVentaDto } from "../dto/DetalleVenta.dto";
import { ValidacionIdPipe } from "src/core-app/utils/validacion-id/validacion-id.pipe";
import { Types } from "mongoose";

@ROLE([RolesE.ADMINISTRADOR])
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


  @Post('kpi')
  kipProductos(@Body() kpiDto: BuscadorVentaDto) {    
    return this.ventaProductoService.kipProductos(kpiDto);
  }
    @Post('kpi/detalle/:sucursal/:rubro')
    detalleProductoKpi(@Param("sucursal", ValidacionIdPipe) sucursal:Types.ObjectId ,  @Param("rubro") rubro:string,  @Body() detalleVentaDto: DetalleVentaDto) {    
    return this.ventaProductoService.detalleProductoKpi(detalleVentaDto, sucursal, rubro);
  }


}
