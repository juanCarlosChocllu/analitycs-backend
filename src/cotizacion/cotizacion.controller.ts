import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CotizacionService } from './cotizacion.service';

@Controller('cotizacion')
export class CotizacionController {
  constructor(private readonly cotizacionService: CotizacionService) {}

}
