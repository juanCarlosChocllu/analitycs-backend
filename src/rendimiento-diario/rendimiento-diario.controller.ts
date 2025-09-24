import { Controller,  Post, Body,  Req, Query, Get , Patch,Param} from '@nestjs/common';
import { RendimientoDiarioService } from './rendimiento-diario.service';
import { CreateRendimientoDiarioDto } from './dto/create-rendimiento-diario.dto';
import type { Request}from 'express'
import { BuscadorRendimientoDiarioDto } from './dto/BuscardorRendimientoDiario';

import { UpdateRendimientoDiarioDto } from './dto/update-rendimiento-diario.dto';

import { Types } from 'mongoose';
import { PaginadorCoreDto } from 'src/core-app/dto/PaginadorCoreDto';
import { ValidacionIdPipe } from 'src/core-app/utils/validacion-id/validacion-id.pipe';
@Controller('rendimiento/diario')
export class RendimientoDiarioController {
  constructor(private readonly rendimientoDiarioService: RendimientoDiarioService) {}

  @Post()
  create(@Req() request:Request,@Body() createRendimientoDiarioDto: CreateRendimientoDiarioDto) {
    return this.rendimientoDiarioService.create(createRendimientoDiarioDto, request);
  }

  @Post('listar')
  findAll(@Body() buscadorRendimientoDiarioDto:BuscadorRendimientoDiarioDto ) {
    return this.rendimientoDiarioService.findAll(buscadorRendimientoDiarioDto);
  }
  
  @Get('listar/asesor')
  listarRendimientoDiarioAsesor( @Req() request:Request, @Query() paginadorDto: PaginadorCoreDto) {
    return this.rendimientoDiarioService.listarRendimientoDiarioAsesor(request, paginadorDto);
  }

 /* @Post('asesor')
  rendimientoDiario(@Req() request:Request  ) {
    return this.rendimientoDiarioService.rendimientoDiarioAsesor(request);
  }*/
  @Patch("/:id")
  update(@Param('id', ValidacionIdPipe) id:Types.ObjectId,@Body() updateRendimientoDiarioDto: UpdateRendimientoDiarioDto) {
    return this.rendimientoDiarioService.update(updateRendimientoDiarioDto, id);
  }

 
}
