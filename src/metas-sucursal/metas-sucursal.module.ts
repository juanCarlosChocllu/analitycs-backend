import { Module } from '@nestjs/common';
import { MetasSucursalService } from './services/metas-sucursal.service';
import { MetasSucursalController } from './controllers/metas-sucursal.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MetasSucursal,
  metasSucursalSchema,
} from './schema/metas-sucursal.schema';

import {
  DiasMetasSucursal,
  diasMetasSucursalSchema,
} from './schema/diasMetaSucursal.schema';
import { DiasMetaService } from './services/diaMeta.service';
import { CicloComercialModule } from 'src/ciclo-comercial/ciclo-comercial.module';

@Module({
  imports: [
    CicloComercialModule,
    MongooseModule.forFeature(
      [
        {
          name: MetasSucursal.name,
          schema: metasSucursalSchema,
        },
        {
          name: DiasMetasSucursal.name,
          schema: diasMetasSucursalSchema,
        },
      ],

    ),
    
    
    
  ],
  controllers: [MetasSucursalController],
  providers: [MetasSucursalService, DiasMetaService],
  exports: [MetasSucursalService],
})
export class MetasSucursalModule {}
