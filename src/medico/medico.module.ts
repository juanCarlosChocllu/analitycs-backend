import { Module } from '@nestjs/common';
import { MedicoService } from './medico.service';
import { MedicoController } from './medico.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Medico, medicoShema } from './schema/medicoSchema';
import { DetalleMedico, detalleMedicoShema } from './schema/detalleMedico';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Medico.name,
        schema: medicoShema,
      },
      {
        name: DetalleMedico.name,
        schema: detalleMedicoShema,
      },
    ]),
  ],
  controllers: [MedicoController],
  providers: [MedicoService],
   exports: [MedicoService],
})
export class MedicoModule {}
