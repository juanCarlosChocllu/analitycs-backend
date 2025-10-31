import { Module } from '@nestjs/common';
import { FacingService } from './facing.service';
import { FacingController } from './facing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Facing, facingSchema } from './schema/facing.schema';

@Module({
   imports: [
     
      MongooseModule.forFeature([
        {
          name: Facing.name,
          schema: facingSchema,
        },
       
      ]),
    ],
  controllers: [FacingController],
  providers: [FacingService],
})
export class FacingModule {}
