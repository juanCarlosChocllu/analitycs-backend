import { Module } from '@nestjs/common';
import { AlmacenService } from './almacen.service';
import { AlmacenController } from './almacen.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Almacen, almacenSchema } from './schema/almacenSchema';

@Module({
    imports:[
        MongooseModule.forFeature([
          {
            name:Almacen.name, schema:almacenSchema
          }
        ])
      ],
  controllers: [AlmacenController],
  providers: [AlmacenService],
    exports: [AlmacenService],
})
export class AlmacenModule {}
