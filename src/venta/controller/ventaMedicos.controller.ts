import { Body, Controller, Post } from "@nestjs/common";
import { VentaLentService } from "../service/ventaLente.service";
import { VentaMedicosService } from "../service/ventaMedicos.service";
import { BuscadorVentaDto } from "../dto/BuscadorVenta.dto";
import { VentaMedicosDto } from "../dto/venta.medicos.dto";
import { BuscadorRecetaDto } from "../dto/BuscadorReceta.dto";

@Controller('venta')
export class VentaMedicosController {
  constructor(
 
    private readonly ventaMedicosService: VentaMedicosService,
  ) {}

    @Post('recetas/actual/medicos')
  kpiMedicosActual(@Body() ventaMedicosDto: VentaMedicosDto) {
    return this.ventaMedicosService.kpiMedicos(ventaMedicosDto);
  }

  @Post('recetas/anterior/medicos')
  kpiMedicosAterior(@Body() ventaMedicosDto: VentaMedicosDto) {
    return this.ventaMedicosService.kpiMedicos(ventaMedicosDto);
  }

    @Post('recetas/medicos')
  listarRecetasMedico(@Body() buscadorRecetaDto: BuscadorRecetaDto) {
    return this.ventaMedicosService.listarRecetasMedico(buscadorRecetaDto);
  }
}