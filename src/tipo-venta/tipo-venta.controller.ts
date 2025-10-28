import { Controller, Get } from '@nestjs/common';
import { TipoVentaService } from './tipo-venta.service';
import { ROLE } from 'src/core-app/decorators/appDecorators';
import { RolesE } from 'src/core-app/enum/coreEnum';

@ROLE([RolesE.ADMINISTRADOR, RolesE.ASESOR, RolesE.GESTOR])
@Controller('tipo/venta')
export class TipoVentaController {
  constructor(private readonly tipoVentaService: TipoVentaService) {}

  @Get('listar')
  listarTipoVenta() {
    return this.tipoVentaService.listarTipoVenta();
  }
}
