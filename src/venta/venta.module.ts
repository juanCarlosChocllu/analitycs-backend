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

@Module({
    imports: [
      StockModule,
      SucursalModule,
      CotizacionModule,
       MetasSucursalModule,
       AsesorModule,
       RendimientoDiarioModule,
      MongooseModule.forFeature(
        [{ name: Venta.name, schema: ventaSchema },{ name: DetalleVenta.name, schema: detalleVentaSchema }],
      
      ),
    ],
  controllers: [VentaController, VentaProductoController, ],
  providers: [VentaService, VentaProductoService, VentaRendimientoDiarioService],
  exports:[VentaService, VentaRendimientoDiarioService]
})
export class VentaModule {}
