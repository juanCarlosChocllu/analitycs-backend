import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FacingService } from './facing.service';
import { CreateFacingDto } from './dto/create-facing.dto';

import { ROLE } from 'src/core-app/decorators/appDecorators';
import { RolesE } from 'src/core-app/enum/coreEnum';
import { BuscadorFacingDto } from './dto/BuscadorFacingDto';
@ROLE([RolesE.ADMINISTRADOR])
@Controller('facing')
export class FacingController {
  constructor(private readonly facingService: FacingService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() createFacingDto: CreateFacingDto) {
    return this.facingService.create(createFacingDto);
  }

  @Post('listar')
  async listarFacing(@Body() buscadorFacingDto: BuscadorFacingDto) {
    return this.facingService.listarFacing(buscadorFacingDto);
  }
}
