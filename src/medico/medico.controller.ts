import { Controller } from '@nestjs/common';
import { MedicoService } from './medico.service';

@Controller('medico')
export class MedicoController {
  constructor(private readonly medicoService: MedicoService) {}
}
