import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MetasSucursalService } from '../services/metas-sucursal.service';
import { CreateMetasSucursalDto } from '../dto/create-metas-sucursal.dto';
import { UpdateMetasSucursalDto } from '../dto/update-metas-sucursal.dto';

import { Types } from 'mongoose';
import { BuscadorMetasDto } from '../dto/BuscadorMetasDto';
import { ValidacionIdPipe } from 'src/core-app/utils/validacion-id/validacion-id.pipe';

@Controller('metas/sucursal')
export class MetasSucursalController {
  constructor(private readonly metasSucursalService: MetasSucursalService) {}

  @Post()
  create(@Body() createMetasSucursalDto: CreateMetasSucursalDto) {
 
    return this.metasSucursalService.create(createMetasSucursalDto);
  }

  @Get()
  findAll(@Query () buscadorMetasDto:BuscadorMetasDto) {   
    return this.metasSucursalService.findAll(buscadorMetasDto);
  }



  @Delete(':id')
  softDelete(@Param('id', ValidacionIdPipe) id: Types.ObjectId) {
    return this.metasSucursalService.softDelete(id);
  }
}
