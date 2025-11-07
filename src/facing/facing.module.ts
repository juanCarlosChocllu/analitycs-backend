import { Module } from '@nestjs/common';
import { FacingService } from './facing.service';
import { FacingController } from './facing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Facing, facingSchema } from './schema/facing.schema';
import { ExhibicionModule } from 'src/exhibicion/exhibicion.module';
import { SucursalModule } from 'src/sucursal/sucursal.module';
import { MarcasModule } from 'src/marcas/marcas.module';

@Module({
   imports: [
      ExhibicionModule,
      SucursalModule,
      MarcasModule,
      MongooseModule.forFeature([
        {
          name: Facing.name,
          schema: facingSchema,
        },
       
      ]),
    ],
  controllers: [FacingController],
  providers: [FacingService],
    exports: [FacingService],
})
export class FacingModule {}
