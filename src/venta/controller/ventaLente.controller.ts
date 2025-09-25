import { Controller } from "@nestjs/common";
import { VentaLentService } from "../service/ventaLente.service";

@Controller('venta')
export class VentaLenteController {
  constructor(
 
    private readonly ventaLentService: VentaLentService,
  ) {}
}