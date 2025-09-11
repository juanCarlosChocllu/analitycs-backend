import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { DescargarProviderDto } from './dto/DescargarProviderDto';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}
      @Post('mia/venta')
  descargarVentas(@Body() descargarProviderDto: DescargarProviderDto) {
    return this.providersService.guardardataVenta(descargarProviderDto);
  }
 
}
