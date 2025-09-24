import { Controller } from '@nestjs/common';
import { AlmacenService } from './almacen.service';

@Controller('almacen')
export class AlmacenController {
  constructor(private readonly almacenService: AlmacenService) {}
}
