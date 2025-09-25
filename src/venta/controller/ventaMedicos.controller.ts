import { Controller } from "@nestjs/common";
import { VentaLentService } from "../service/ventaLente.service";

@Controller('venta')
export class VentaMedicosController {
  constructor(
 
    private readonly ventaLentService: VentaLentService,
  ) {}
}