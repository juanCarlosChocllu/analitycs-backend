import {
  Controller,
  Post,
  Body

} from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { DescargarProviderDto } from './dto/DescargarProviderDto';
import { ROLE } from 'src/core-app/decorators/appDecorators';
import { RolesE } from 'src/core-app/enum/coreEnum';

@ROLE([RolesE.ADMINISTRADOR])
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}
  @Post('mia/venta')
  descargarVentas(@Body() descargarProviderDto: DescargarProviderDto) {
    return this.providersService.guardardataVenta(descargarProviderDto);
  }
  @Post('stock/Mia')
  descargarStockProductos(@Body() descargarProviderDto: DescargarProviderDto) {
    return this.providersService.descargarStockProductos(descargarProviderDto);
  }

  @Post('mia/cotizacion')
  descargarCotizacion(@Body() descargarProviderDto: DescargarProviderDto) {
    return this.providersService.descargarCotizacion(descargarProviderDto);
  }

  @Post('receta')
  descargarReceta(@Body() fechaDto: DescargarProviderDto) {
    return this.providersService.descargarReceta(fechaDto);
  }
  @Post('mia/venta/finalizar')
  finalizarVentas(@Body() descargarProviderDto: DescargarProviderDto) {
    return this.providersService.finalizarVentas(descargarProviderDto);
  }

  @Post('mia/venta/anular')
  anularVentas(@Body() descargarProviderDto: DescargarProviderDto) {
    return this.providersService.anularVentas(descargarProviderDto);
  }
}
