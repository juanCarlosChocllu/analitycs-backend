import { Controller} from '@nestjs/common';
import { ColorService } from './color.service';
import { ROLE } from 'src/core-app/decorators/appDecorators';
import { RolesE } from 'src/core-app/enum/coreEnum';
@ROLE([RolesE.ADMINISTRADOR])
@Controller('color')
export class ColorController {
  constructor(private readonly colorService: ColorService) {}


}
