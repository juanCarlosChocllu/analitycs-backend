import { Module } from '@nestjs/common';
import { CotizacionService } from './cotizacion.service';
import { CotizacionController } from './cotizacion.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cotizacion, cotizacionSchema } from './schema/cotizacion.schema';
import {
  DetalleCotizacion,
  detalleCotizacionSchema,
} from './schema/detalleContizacion';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cotizacion.name, schema: cotizacionSchema },
      { name: DetalleCotizacion.name, schema: detalleCotizacionSchema },
    ]),
  ],
  controllers: [CotizacionController],
  providers: [CotizacionService],
  exports: [CotizacionService],
})
export class CotizacionModule {}
