import { Controller, Get} from '@nestjs/common';
import { CicloComercialService } from './ciclo-comercial.service';
import { ROLE } from 'src/core-app/decorators/appDecorators';
import { RolesE } from 'src/core-app/enum/coreEnum';
@ROLE([RolesE.ADMINISTRADOR, RolesE.ASESOR, RolesE.GESTOR])
@Controller('ciclo/comercial')
export class CicloComercialController {
  constructor(private readonly cicloComercialService: CicloComercialService) {}
  @Get()
  listar(){
    return this.cicloComercialService.listar()
  }

}
