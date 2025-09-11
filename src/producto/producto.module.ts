import { Module } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { ProductoController } from './producto.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Producto, productoSchema } from './schema/producto.schema';
import { MarcasModule } from 'src/marcas/marcas.module';
import { TipoMonturaModule } from 'src/tipo-montura/tipo-montura.module';
import { ColorModule } from 'src/color/color.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Producto.name,
        schema: productoSchema,
      },
    ]),
    MarcasModule,
    TipoMonturaModule,
    ColorModule,
  ],
  controllers: [ProductoController],
  providers: [ProductoService],
  exports: [ProductoService],
})
export class ProductoModule {}
