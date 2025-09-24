import { Module } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { ProvidersController } from './providers.controller';
import { CoreAppModule } from 'src/core-app/core-app.module';
import { HttpModule } from '@nestjs/axios';
import { SucursalModule } from 'src/sucursal/sucursal.module';
import { TipoVentaModule } from 'src/tipo-venta/tipo-venta.module';
import { AsesorModule } from 'src/asesor/asesor.module';
import { VentaModule } from 'src/venta/venta.module';
import { ProductoModule } from 'src/producto/producto.module';
import { RangosModule } from 'src/rangos/rangos.module';
import { MaterialModule } from 'src/material/material.module';
import { TipoLenteModule } from 'src/tipo-lente/tipo-lente.module';
import { MarcaLenteModule } from 'src/marca-lente/marca-lente.module';
import { TratamientoModule } from 'src/tratamiento/tratamiento.module';
import { ColorLenteModule } from 'src/color-lente/color-lente.module';
import { TipoColorModule } from 'src/tipo-color/tipo-color.module';
import { RecetaModule } from 'src/receta/receta.module';
import { MedicoModule } from 'src/medico/medico.module';
import { StockModule } from 'src/stock/stock.module';
import { CotizacionModule } from 'src/cotizacion/cotizacion.module';

@Module({
  imports: [
    CoreAppModule,
    HttpModule,
    SucursalModule,
    TipoVentaModule,
    AsesorModule,
    VentaModule,
    ProductoModule,
    RangosModule,
    MaterialModule,
    TipoLenteModule,
    MarcaLenteModule,
    TratamientoModule,
    TipoColorModule,
    ColorLenteModule,
    RecetaModule,
    MedicoModule,
    StockModule,
    CotizacionModule
  ],
  controllers: [ProvidersController],
  providers: [ProvidersService],
})
export class ProvidersModule {}
