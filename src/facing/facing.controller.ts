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
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FacingService } from './facing.service';
import { CreateFacingDto } from './dto/create-facing.dto';

import { ROLE } from 'src/core-app/decorators/appDecorators';
import { RolesE } from 'src/core-app/enum/coreEnum';
import { BuscadorFacingDto } from './dto/BuscadorFacingDto';
import { Types } from 'mongoose';
import { multerConfig } from 'src/core-app/multer/multerConfig';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Delete(':id')
  async eliminarFacing(@Param('id') id: Types.ObjectId) {
    return this.facingService.eliminarFacing(id);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('xlsx/carga/masiva')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async cargaMasiva(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException();
      }
      return this.facingService.cargaMasiva(file);
    } catch (error) {
      throw new BadRequestException();
    }
  }
}
