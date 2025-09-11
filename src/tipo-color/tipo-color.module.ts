import { Module } from '@nestjs/common';
import { TipoColorService } from './tipo-color.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TipoColor, tipoColorSchema } from './schema/tipo-color.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TipoColor.name,
        schema: tipoColorSchema,
      },
    ]),
  ],
  controllers: [],
  providers: [TipoColorService],
  exports: [TipoColorService],
})
export class TipoColorModule {}
