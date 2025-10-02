import { Controller} from '@nestjs/common';
import { ColorLenteService } from './color-lente.service';
import { ROLE } from 'src/core-app/decorators/appDecorators';
import { RolesE } from 'src/core-app/enum/coreEnum';
@ROLE([RolesE.ADMINISTRADOR])
@Controller('color-lente')
export class ColorLenteController {
  constructor(private readonly colorLenteService: ColorLenteService) {}

  
}
