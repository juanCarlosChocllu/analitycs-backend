import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CotizacionService } from './cotizacion.service';
import { BuscadorCotizacionDto } from './dto/BuscadorCotizacion.dto';

@Controller('cotizacion')
export class CotizacionController {
  constructor(private readonly cotizacionService: CotizacionService) {}

  @Post("reporte")
  reporteCotizacion (@Body() buscadorCotizacionDto:BuscadorCotizacionDto){
    return this.cotizacionService.reporteCotizacion(buscadorCotizacionDto)
  }
}
