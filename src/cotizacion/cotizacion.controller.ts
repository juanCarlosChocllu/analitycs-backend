import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CotizacionService } from './cotizacion.service';
import { BuscadorCotizacionDto } from './dto/BuscadorCotizacion.dto';
import { ROLE } from 'src/core-app/decorators/appDecorators';
import { RolesE } from 'src/core-app/enum/coreEnum';

@ROLE([RolesE.ADMINISTRADOR])
@Controller('cotizacion')
export class CotizacionController {
  constructor(private readonly cotizacionService: CotizacionService) {}

  @Post("reporte")
  reporteCotizacion (@Body() buscadorCotizacionDto:BuscadorCotizacionDto){
    return this.cotizacionService.reporteCotizacion(buscadorCotizacionDto)
  }
}
