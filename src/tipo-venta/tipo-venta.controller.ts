import { Controller, Get, UseGuards } from '@nestjs/common';
import { TipoVentaService } from './tipo-venta.service';


@Controller('tipo/venta')
export class TipoVentaController {
  constructor(private readonly tipoVentaService: TipoVentaService) {}
  @Get('listar')
  listarTipoVenta(){
    return this.tipoVentaService.listarTipoVenta();
  }
}
