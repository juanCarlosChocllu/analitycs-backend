import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { HttpStatusCode } from 'axios';
import { AsignarCategoriaDto } from './dto/asignarCategoriaDto';
import { MarcasService } from './marcas.service';
import { ROLE } from 'src/core-app/decorators/appDecorators';
import { RolesE } from 'src/core-app/enum/coreEnum';

@ROLE([RolesE.ADMINISTRADOR])
@Controller('marca')
export class MarcaController {
  constructor(private readonly marcaService:MarcasService) {}
  @Get()
  listarMarcas() {
    return this.marcaService.listarMarcas();
  }
  @Post('categoria')
  @HttpCode(HttpStatusCode.Ok)
  asignarCategoriaMarca(@Body() asignarCategoriaDto: AsignarCategoriaDto) {
 
    return this.marcaService.asignarCategoriaMarca(asignarCategoriaDto);
  }
}
