import { Module } from '@nestjs/common';
import { VentaService } from './venta.service';
import { VentaController } from './venta.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Venta, ventaSchema } from './schema/venta.schema';
import { DetalleVenta, detalleVentaSchema } from './schema/detalleVenta';

@Module({
    imports: [
      MongooseModule.forFeature(
        [{ name: Venta.name, schema: ventaSchema },{ name: DetalleVenta.name, schema: detalleVentaSchema }],
      
      ),
    ],
  controllers: [VentaController],
  providers: [VentaService],
  exports:[VentaService]
})
export class VentaModule {}
