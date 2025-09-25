import { Module } from '@nestjs/common';
import { VentaService } from './service/venta.service';

import { MongooseModule } from '@nestjs/mongoose';
import { Venta, ventaSchema } from './schema/venta.schema';
import { DetalleVenta, detalleVentaSchema } from './schema/detalleVenta';
import { VentaController } from './controller/venta.controller';
import { VentaProductoService } from './service/ventaProducto.service';
import { VentaProductoController } from './controller/ventaProducto.controller';
import { StockModule } from 'src/stock/stock.module';
import { SucursalModule } from 'src/sucursal/sucursal.module';
import { CotizacionModule } from 'src/cotizacion/cotizacion.module';
import { VentaRendimientoDiarioService } from './service/ventaRendimientoDiario.service';
import { MetasSucursalModule } from 'src/metas-sucursal/metas-sucursal.module';
import { AsesorModule } from 'src/asesor/asesor.module';
import { RendimientoDiarioModule } from 'src/rendimiento-diario/rendimiento-diario.module';
import { VentaMestasSucursalController } from './controller/ventaMetas.controller';
import { VentaMetasService } from './service/ventaMentas.service';
import { DiasModule } from 'src/dias/dias.module';
import { VentaMedicosService } from './service/ventaMedicos.service';
import { VentaLentService } from './service/ventaLente.service';
import { VentaLenteController } from './controller/ventaLente.controller';
import { VentaMedicosController } from './controller/ventaMedicos.controller';

@Module({
  imports: [
    StockModule,
    SucursalModule,
    CotizacionModule,
    MetasSucursalModule,
    AsesorModule,
    RendimientoDiarioModule,
    DiasModule,
    MongooseModule.forFeature([
      { name: Venta.name, schema: ventaSchema },
      { name: DetalleVenta.name, schema: detalleVentaSchema },
    ]),
  ],
  controllers: [
    VentaController,
    VentaProductoController,
    VentaMestasSucursalController,
    VentaLenteController,
    VentaMedicosController
  ],
  providers: [
    VentaService,
    VentaProductoService,
    VentaRendimientoDiarioService,
    VentaMetasService,
    VentaMedicosService,
    VentaLentService
  ],
  exports: [VentaService, VentaRendimientoDiarioService],
})
export class VentaModule {}
