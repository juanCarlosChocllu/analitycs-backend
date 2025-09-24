import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AsesorService } from './asesor.service';
import { CreateAsesorDto } from './dto/create-asesor.dto';
import { UpdateAsesorDto } from './dto/update-asesor.dto';
import { ValidacionIdPipe } from 'src/core-app/utils/validacion-id/validacion-id.pipe';
import { Types } from 'mongoose';

@Controller('asesor')
export class AsesorController {
  constructor(private readonly asesorService: AsesorService) {}

  @Get('listar')
  listar() {
    return this.asesorService.listar();
  }
     @Get('sucursal/:asesor')
  listarSucursalesAsesores(@Param('asesor', ValidacionIdPipe) asesor: Types.ObjectId) {
    console.log(asesor);
    
    return this.asesorService.listarSucursalesAsesores(asesor);
  }
  
}
