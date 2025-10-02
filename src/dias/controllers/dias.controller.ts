import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { DiasService } from '../services/dias.service';
import { CreateDiaDto } from '../dto/create-dia.dto';
import { UpdateDiaDto } from '../dto/update-dia.dto';

import { Types } from 'mongoose';
import { ValidacionIdPipe } from 'src/core-app/utils/validacion-id/validacion-id.pipe';
import { ROLE } from 'src/core-app/decorators/appDecorators';
import { RolesE } from 'src/core-app/enum/coreEnum';

@ROLE([RolesE.ADMINISTRADOR])
@Controller('dias')
export class DiasController {
  constructor(private readonly diasService: DiasService) {}

  @Post()
  create(@Body() createDiaDto: CreateDiaDto) {
   
    return this.diasService.create(createDiaDto);
  }

  @Get()
  findAll() {
    return this.diasService.findAll();
  }

  @Get(':nombreDia')
  listarDias(@Param('nombreDia', ValidacionIdPipe) nombreDia: Types.ObjectId) {
    return this.diasService.listarDias(nombreDia);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDiaDto: UpdateDiaDto) {
    return this.diasService.update(+id, updateDiaDto);
  }

  @Delete(':dia')
  remove(@Param('dia', ValidacionIdPipe) dia: Types.ObjectId) {
    return this.diasService.remove(dia);
  }
}
