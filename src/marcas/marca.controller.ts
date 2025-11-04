import { BadRequestException, Body, Controller, Get, HttpCode, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { HttpStatusCode } from 'axios';
import { AsignarCategoriaDto } from './dto/asignarCategoriaDto';
import { MarcasService } from './marcas.service';
import { ROLE } from 'src/core-app/decorators/appDecorators';
import { RolesE } from 'src/core-app/enum/coreEnum';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/core-app/multer/multerConfig';

@ROLE([RolesE.ADMINISTRADOR])
@Controller('marca')
export class MarcaController {
  constructor(private readonly marcaService: MarcasService) {}
  @Get()
  listarMarcas() {
    return this.marcaService.listarMarcas();
  }
  @Post('categoria')
  @HttpCode(HttpStatusCode.Ok)
  asignarCategoriaMarca(@Body() asignarCategoriaDto: AsignarCategoriaDto) {
    return this.marcaService.asignarCategoriaMarca(asignarCategoriaDto);
  }

  @Post('guardar/xlsx')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  asignarCategoriaMarcas(@UploadedFile() file: Express.Multer.File) {
   try {
      if (!file) {
        throw new BadRequestException();
      }
      return this.marcaService.asignarCategoriaMarcas(file.filename);
    } catch (error) {
      throw new BadRequestException();
    }
  }
}
