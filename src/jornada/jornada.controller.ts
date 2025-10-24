import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { JornadaService } from './jornada.service';
import { CreateJornadaDto } from './dto/create-jornada.dto';
import { ROLE } from 'src/core-app/decorators/appDecorators';
import { RolesE } from 'src/core-app/enum/coreEnum';
import { ValidacionIdPipe } from 'src/core-app/utils/validacion-id/validacion-id.pipe';
import { Types } from 'mongoose';
import { HttpStatusCode } from 'axios';
@ROLE([RolesE.ADMINISTRADOR, RolesE.GESTOR])
@Controller('jornada')
export class JornadaController {
  constructor(private readonly jornadaService: JornadaService) {}

  @Post()
  create(@Body() createJornadaDto: CreateJornadaDto) {
    return this.jornadaService.create(createJornadaDto);
  }
  @HttpCode(HttpStatusCode.Ok)
  @Delete('/:id')
  eliminar(@Param('id', ValidacionIdPipe) id: Types.ObjectId) {
    return this.jornadaService.eliminar(id);
  }
}
