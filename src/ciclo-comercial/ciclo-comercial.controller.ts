import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CicloComercialService } from './ciclo-comercial.service';

@Controller('ciclo-comercial')
export class CicloComercialController {
  constructor(private readonly cicloComercialService: CicloComercialService) {}

}
