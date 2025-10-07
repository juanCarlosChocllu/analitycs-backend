import { Module } from '@nestjs/common';
import { TraficoService } from './trafico.service';
import { TraficoController } from './trafico.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Trafico, TraficoSchema } from './schema/trafico.Schema';

@Module({
   imports: [  
      MongooseModule.forFeature([
        { name: Trafico.name, schema: TraficoSchema },
    
      ]),
    ],
  controllers: [TraficoController],
  providers: [TraficoService],
})
export class TraficoModule {}
