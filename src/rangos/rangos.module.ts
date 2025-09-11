import { Module } from '@nestjs/common';
import { RangosService } from './rangos.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Rango, rangoSchema , } from './schema/rango.schema';


@Module({

  imports:[
    MongooseModule.forFeature([
      {
        name:Rango.name, schema:rangoSchema
      }
    ])
  ],
  controllers: [],
  providers: [RangosService],
  exports:[RangosService]
})
export class RangosModule {}
