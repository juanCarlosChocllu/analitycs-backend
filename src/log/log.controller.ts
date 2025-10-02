import { Controller, Get } from '@nestjs/common';
import { LogService } from './log.service';
import { ROLE } from 'src/core-app/decorators/appDecorators';
import { RolesE } from 'src/core-app/enum/coreEnum';

@ROLE([RolesE.ADMINISTRADOR, RolesE.ASESOR, RolesE.GESTOR])
@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get('venta/descarga')
  logDescargas() {
    return this.logService.listarLogdescarga();
  }
}
