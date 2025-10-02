import { Controller} from '@nestjs/common';
import { PrecioService } from './precio.service';

import { ROLE } from 'src/core-app/decorators/appDecorators';
import { RolesE } from 'src/core-app/enum/coreEnum';

@ROLE([RolesE.ADMINISTRADOR])
@Controller('precio')
export class PrecioController {
  constructor(private readonly precioService: PrecioService) {}

  
}
