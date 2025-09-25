import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { Dia, diaSchema } from './schema/dia.schema';
import { NombreDia, nombreDiaSchema } from './schema/nombreDia.schema';
import { DiasService } from './services/dias.service';
import { DiasController } from './controllers/dias.controller';
import { NombreDiaService } from './services/nombreDia.service';
import { NombreDiaController } from './controllers/nombreDia.controller';

@Module({
    imports:[
      MongooseModule.forFeature(
        [
          {
            name: Dia.name,
            schema: diaSchema,
          },
          {
            name: NombreDia.name,
            schema: nombreDiaSchema,
          },
         
         
        ]
        
      ),
    ],
  controllers: [DiasController, NombreDiaController],
  providers: [DiasService, NombreDiaService],
  exports:[DiasService]
})
export class DiasModule {}
