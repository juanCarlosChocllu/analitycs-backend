import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Stock, stockSchema } from './schema/stockSchema';
import { AlmacenModule } from 'src/almacen/almacen.module';
import { SucursalModule } from 'src/sucursal/sucursal.module';

@Module({
  imports: [
    AlmacenModule,
    SucursalModule,
    MongooseModule.forFeature([
      {
        name: Stock.name,
        schema: stockSchema,
      },
    ]),
  ],
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {}
