import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FacingService } from './facing.service';
import { CreateFacingDto } from './dto/create-facing.dto';
import { UpdateFacingDto } from './dto/update-facing.dto';
import { Types } from 'mongoose';

@Controller('facing')
export class FacingController {
  constructor(private readonly facingService: FacingService) {}

  @Post()
  async create(@Body() createFacingDto: CreateFacingDto) {
 
    return this.facingService.create(createFacingDto);
  }

 
}
