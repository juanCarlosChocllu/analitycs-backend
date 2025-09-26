import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PrecioService } from './precio.service';
import { CreatePrecioDto } from './dto/create-precio.dto';
import { UpdatePrecioDto } from './dto/update-precio.dto';

@Controller('precio')
export class PrecioController {
  constructor(private readonly precioService: PrecioService) {}

  
}
