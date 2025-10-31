import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExhibicionService } from './exhibicion.service';
import { CreateExhibicionDto } from './dto/create-exhibicion.dto';
import { UpdateExhibicionDto } from './dto/update-exhibicion.dto';
import { ROLE } from 'src/core-app/decorators/appDecorators';
import { RolesE } from 'src/core-app/enum/coreEnum';
@ROLE([RolesE.ADMINISTRADOR])
@Controller('exhibicion')
export class ExhibicionController {
  constructor(private readonly exhibicionService: ExhibicionService) {}

  @Post()
  create(@Body() createExhibicionDto: CreateExhibicionDto) {
    return this.exhibicionService.create(createExhibicionDto);
  }

  @Get()
  findAll() {
    return this.exhibicionService.findAll();
  }

}
