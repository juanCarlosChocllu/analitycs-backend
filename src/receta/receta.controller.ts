import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RecetaService } from './receta.service';

@Controller('receta')
export class RecetaController {
  constructor(private readonly recetaService: RecetaService) {}

 
}
