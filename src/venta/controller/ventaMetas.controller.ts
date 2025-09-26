import { Body, Controller, Post } from "@nestjs/common";
import { BuscadorVentaDto } from "../dto/BuscadorVenta.dto";
import { VentaMetasService } from "../service/ventaMetas.service";

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
    
}
