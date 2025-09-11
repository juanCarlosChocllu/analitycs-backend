import { Module } from '@nestjs/common';
import { TipoLenteService } from './tipo-lente.service';

import { MongooseModule } from '@nestjs/mongoose';
import { TipoLente, TipoLenteSchema } from './schema/tipo-lente.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: TipoLente.name,
          schema: TipoLenteSchema,
        },
      ]

    ),
  ],
  controllers: [],
  providers: [TipoLenteService],
  exports: [TipoLenteService],
})
export class TipoLenteModule {}
