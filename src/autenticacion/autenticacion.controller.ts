import {
  Controller,
  Res,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import { AutenticacionService } from './autenticacion.service';
import { AutenticacionDto } from './dto/create-autenticacion.dto';
import { Publico } from './decorators/publico';

@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  @Post()
  @Publico()
  create(@Body() AutenticacionDto: AutenticacionDto) {
    return this.autenticacionService.autenticacion(AutenticacionDto);
  }
}
