import { Controller } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { ROLE } from 'src/core-app/decorators/appDecorators';
import { RolesE } from 'src/core-app/enum/coreEnum';

@ROLE([RolesE.ADMINISTRADOR])
@Controller('producto')
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {

  }
}


