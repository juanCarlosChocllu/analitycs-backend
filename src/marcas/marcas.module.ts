import { Module } from '@nestjs/common';
import { MarcasService } from './marcas.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Marca, marcaSchema } from './schema/marca.schema';
import { MarcaController } from './marca.controller';


@Module({
  imports:[
    MongooseModule.forFeature([
      {
        name:Marca.name, schema:marcaSchema
      }
    ])
  ],
  controllers: [MarcaController],
  providers: [MarcasService],
  exports:[MarcasService]
})
export class MarcasModule {}
