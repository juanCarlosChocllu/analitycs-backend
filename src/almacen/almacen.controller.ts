import { Controller } from '@nestjs/common';
import { AlmacenService } from './almacen.service';
import { ROLE } from 'src/core-app/decorators/appDecorators';
import { RolesE } from 'src/core-app/enum/coreEnum';


@ROLE([RolesE.ADMINISTRADOR])
@Controller('almacen')
export class AlmacenController {
  constructor(private readonly almacenService: AlmacenService) {}
}
