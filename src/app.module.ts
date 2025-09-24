import { Module } from '@nestjs/common';
import { VentaModule } from './venta/venta.module';
import { StockModule } from './stock/stock.module';
import { AsesorModule } from './asesor/asesor.module';
import { ProvidersModule } from './providers/providers.module';
import { ColorModule } from './color/color.module';
import { EmpresaModule } from './empresa/empresa.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MarcasModule } from './marcas/marcas.module';
import { SucursalModule } from './sucursal/sucursal.module';
import { TipoMonturaModule } from './tipo-montura/tipo-montura.module';
import { PrecioModule } from './precio/precio.module';
import { RecetaModule } from './receta/receta.module';
import { CoreAppModule } from './core-app/core-app.module';
import { AppConfigService } from './core-app/config/appConfigService';
import { MedicoModule } from './medico/medico.module';
import { RangosModule } from './rangos/rangos.module';
import { MaterialModule } from './material/material.module';
import { TipoLenteModule } from './tipo-lente/tipo-lente.module';
import { MarcaLente } from './marca-lente/schema/marca-lente.schema';
import { MarcaLenteModule } from './marca-lente/marca-lente.module';
import { TratamientoModule } from './tratamiento/tratamiento.module';
import { TipoColorModule } from './tipo-color/tipo-color.module';
import { ColorLenteModule } from './color-lente/color-lente.module';
import { AlmacenModule } from './almacen/almacen.module';
import { CotizacionModule } from './cotizacion/cotizacion.module';
import { MetasSucursalModule } from './metas-sucursal/metas-sucursal.module';
import { RendimientoDiarioModule } from './rendimiento-diario/rendimiento-diario.module';
import { UsuarioModule } from './usuario/usuario.module';
import { AutenticacionModule } from './autenticacion/autenticacion.module';
import { APP_GUARD } from '@nestjs/core';
import { TokenGuard } from './autenticacion/guards/token/token.guard';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [CoreAppModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        uri: config.databaseUrl,
      }),
    }),
    VentaModule,
    AsesorModule,
    ColorModule,
    EmpresaModule,
    StockModule,
    AsesorModule,
    ProvidersModule,
    MarcasModule,
    SucursalModule,
    TipoMonturaModule,
    PrecioModule,
    RecetaModule,
    CoreAppModule,
    MedicoModule,
    //lente
    RangosModule,
    MaterialModule,
    TipoLenteModule,
    MarcaLenteModule,
    TratamientoModule,
    TipoColorModule,
    ColorLenteModule,
    AlmacenModule,
    CotizacionModule,
    MetasSucursalModule,
    RendimientoDiarioModule,
    UsuarioModule,
    AutenticacionModule,
  ],
  controllers: [],
  providers: [ {
      provide:APP_GUARD,
      useClass:TokenGuard
    }],
})
export class AppModule {}
