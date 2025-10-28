import {
  Controller,
  Get,
} from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { ROLE } from 'src/core-app/decorators/appDecorators';
import { RolesE } from 'src/core-app/enum/coreEnum';

@ROLE([RolesE.ADMINISTRADOR, RolesE.ASESOR, RolesE.GESTOR])
@Controller('empresa')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}
  @Get()
  async empresas() {
    return await this.empresaService.empresas();
  }

}
