import { Controller } from '@nestjs/common';
import { TipoMonturaService } from './tipo-montura.service';
@Controller('tipo-montura')
export class TipoMonturaController {
  constructor(private readonly tipoMonturaService: TipoMonturaService) {}

  
}
