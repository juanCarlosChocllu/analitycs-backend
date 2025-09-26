import { Module } from '@nestjs/common';
import { PrecioService } from './precio.service';
import { PrecioController } from './precio.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Precio, PrecioSchema } from './schema/precio.schema';

@Module({
    imports: [
      MongooseModule.forFeature(
        [
          {
            name: Precio.name,
            schema: PrecioSchema,
          },
        ]
      ),
    ],
  controllers: [PrecioController],
  providers: [PrecioService],
  exports: [PrecioService],
})
export class PrecioModule {}
