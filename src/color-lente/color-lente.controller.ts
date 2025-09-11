import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ColorLenteService } from './color-lente.service';

@Controller('color-lente')
export class ColorLenteController {
  constructor(private readonly colorLenteService: ColorLenteService) {}

  
}
