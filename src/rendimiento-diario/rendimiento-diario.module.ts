import { forwardRef, Module } from '@nestjs/common';
import { RendimientoDiarioService } from './rendimiento-diario.service';
import { RendimientoDiarioController } from './rendimiento-diario.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RendimientoDiario, rendimientoDiarioSchema } from './schema/rendimientoDiarioSchema';
import { VentaModule } from 'src/venta/venta.module';
import { JornadaModule } from 'src/jornada/jornada.module';

@Module({

  imports:[
    forwardRef(()=> VentaModule),
   JornadaModule,
    MongooseModule.forFeature([
          {
            name: RendimientoDiario.name,
            schema: rendimientoDiarioSchema,
          },
        ])
  ],
  controllers: [RendimientoDiarioController],
  providers: [RendimientoDiarioService],
  exports:[RendimientoDiarioService]
})
export class RendimientoDiarioModule {}
