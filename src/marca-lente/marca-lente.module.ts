import { Module } from '@nestjs/common';
import { MarcaLenteService } from './marca-lente.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MarcaLente, MarcaLenteSchema } from './schema/marca-lente.schema';


@Module({
  imports:[
    MongooseModule.forFeature([
      {
        name:MarcaLente.name, schema:MarcaLenteSchema
      }
    ])
  ],
  controllers: [],
  providers: [MarcaLenteService],
  exports:[MarcaLenteService]
})
export class MarcaLenteModule {}
