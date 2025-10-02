import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { DiasService } from '../services/dias.service';
import { NombreDiaService } from '../services/nombreDia.service';
import { Types } from 'mongoose';
import { ValidacionIdPipe } from 'src/core-app/utils/validacion-id/validacion-id.pipe';
import { ROLE } from 'src/core-app/decorators/appDecorators';
import { RolesE } from 'src/core-app/enum/coreEnum';


@ROLE([RolesE.ADMINISTRADOR])
@Controller('nombre/dia')
export class NombreDiaController {
  constructor(private readonly nombreDiaService: NombreDiaService) {}

  @Get()
  findAll() {
    return this.nombreDiaService.listarNombreDia();
  }

  
  @Delete(':id')
  delete(@Param('id', ValidacionIdPipe) id:Types.ObjectId) {
    return this.nombreDiaService.delete(id);
  }

}
