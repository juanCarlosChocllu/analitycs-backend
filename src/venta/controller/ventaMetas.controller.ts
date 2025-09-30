import { Body, Controller, Param, Post } from "@nestjs/common";
import { BuscadorVentaDto } from "../dto/BuscadorVenta.dto";
import { VentaMetasService } from "../service/ventaMetas.service";
import { ValidacionIdPipe } from "src/core-app/utils/validacion-id/validacion-id.pipe";
import { Types } from "mongoose";
import { DetalleVenta } from "../schema/detalleVenta";
import { DetalleVentaDto } from "../dto/DetalleVenta.dto";

@Controller('venta/meta/sucursal')
export class VentaMestasSucursalController  {
      constructor(private readonly VentaMetasService:VentaMetasService){}
    @Post('actual')
    public metasDeVentaActual(@Body() ventaTodasDto:BuscadorVentaDto){
        return  this.VentaMetasService.metasDeVenta(ventaTodasDto)
    }

    @Post('anterior')
    public metasDeVentaAnterior(@Body() ventaTodasDto:BuscadorVentaDto){
        return  this.VentaMetasService.metasDeVenta(ventaTodasDto)
    }

    @Post('detalle/:sucursal')
    public detalleVentaMetas(@Param('sucursal', new ValidacionIdPipe()) sucursal:Types.ObjectId,@Body() detalleVentaMetaDto:DetalleVentaDto){
        return this.VentaMetasService.detalleVentaMetas(detalleVentaMetaDto, sucursal)

    }
    
}
