import { Module } from '@nestjs/common';
import { AsesorService } from './asesor.service';
import { AsesorController } from './asesor.controller';
import { Asesor, asesorSchema } from './schema/asesor.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { DetalleAsesor, detalleAsesorSchema } from './schema/detalleAsesor';

@Module({
  imports: [
      MongooseModule.forFeature(
        [
          { name: Asesor.name, schema: asesorSchema },
            { name: DetalleAsesor.name, schema: detalleAsesorSchema },
        ],
      
      ),
    ],
  controllers: [AsesorController],
  providers: [AsesorService],
  exports :[AsesorService]

})
export class AsesorModule {}
