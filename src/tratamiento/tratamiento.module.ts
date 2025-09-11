import { Module } from '@nestjs/common';
import { TratamientoService } from './tratamiento.service';
import { TratamientoController } from './tratamiento.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Tratamiento, TratamientoSchema } from './schema/tratamiento.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: Tratamiento.name,
          schema: TratamientoSchema,
        },
      ]
    ),
  ],
  controllers: [TratamientoController],
  providers: [TratamientoService],
  exports: [TratamientoService],
})
export class TratamientoModule {}
