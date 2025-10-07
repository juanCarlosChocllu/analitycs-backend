import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TraficoService } from './trafico.service';

@Controller('trafico')
export class TraficoController {
  constructor(private readonly traficoService: TraficoService) {}

 
}
