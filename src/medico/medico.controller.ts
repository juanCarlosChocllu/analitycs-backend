import { Controller } from '@nestjs/common';
import { MedicoService } from './medico.service';
import { ROLE } from 'src/core-app/decorators/appDecorators';
import { RolesE } from 'src/core-app/enum/coreEnum';

@ROLE([RolesE.ADMINISTRADOR])
@Controller('medico')
export class MedicoController {
  constructor(private readonly medicoService: MedicoService) {}
}
