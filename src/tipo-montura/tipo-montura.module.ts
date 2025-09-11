import { Module } from '@nestjs/common';
import { TipoMonturaService } from './tipo-montura.service';
import { TipoMonturaController } from './tipo-montura.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TipoMontura, tipoMonturaSchema } from './schema/tipo-montura.schema';

@Module({
  imports: [
      MongooseModule.forFeature(
        [
          {
            name: TipoMontura.name,
            schema: tipoMonturaSchema,
          },
        ],

      ),
    ],
  controllers: [TipoMonturaController],
  providers: [TipoMonturaService],
  exports :[TipoMonturaService]
})
export class TipoMonturaModule {}
