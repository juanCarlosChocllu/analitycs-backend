import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SucursalService } from './sucursal.service';

import { Types } from 'mongoose';
import { ValidacionIdPipe } from 'src/core-app/utils/validacion-id/validacion-id.pipe';
import { ROLE } from 'src/core-app/decorators/appDecorators';
import { RolesE } from 'src/core-app/enum/coreEnum';

@ROLE([RolesE.ADMINISTRADOR])
@Controller()
export class SucursalController {
  constructor(private readonly sucursalService: SucursalService) {}

  @Get('sucursal/:id')
  async sucursalExcel(@Param('id', ValidacionIdPipe) id: string) {
    return await this.sucursalService.sucursalListaEmpresas(new Types.ObjectId(id));
  }

  @Post('sucursal/guardar')
  guardarEmpresaYsusSucursales (){
    return this.sucursalService.guardarEmpresaYsusSucursales()
  }

  @Get('sucursales')
   listarTodasLasSucursales(){
        return this.sucursalService.listarTodasLasSucursales()
   }

  @Post('sucursal/guardarSucursal')
  guardarSucursal (@Body() body: { empresa: string; sucursal: string }) {
    return this.sucursalService.guardarSucursal(body.empresa, body.sucursal);
  }
}
