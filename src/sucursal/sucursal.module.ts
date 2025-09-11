import { Module } from '@nestjs/common';
import { SucursalService } from './sucursal.service';
import { SucursalController } from './sucursal.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Sucursal, SuscursalSchema } from './schema/sucursal.schema';

import { Empresa, EmpresaSchema } from 'src/empresa/schemas/empresa.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
      
        { name: Sucursal.name, schema: SuscursalSchema },
        { name: Empresa.name, schema: EmpresaSchema }      
      
      ],

    ),
  ],
  controllers: [SucursalController],
  providers: [SucursalService],
  exports: [SucursalService],
})
export class SucursalModule {}
