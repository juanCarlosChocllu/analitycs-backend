import { Module } from '@nestjs/common';
import { ExhibicionService } from './exhibicion.service';
import { ExhibicionController } from './exhibicion.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Exhibicion, exhibicionSchema } from './schema/exhibicion.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Exhibicion.name,
        schema: exhibicionSchema,
      },
    ]),
  ],
  controllers: [ExhibicionController],
  providers: [ExhibicionService],
  exports: [ExhibicionService],
})
export class ExhibicionModule {}
