import { Module } from '@nestjs/common';
import { CicloComercialService } from './ciclo-comercial.service';
import { CicloComercialController } from './ciclo-comercial.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CicloComercial, CicloComercialSchema } from './schema/ciclo-comercial.schema';

@Module({
   imports :[
        MongooseModule.forFeature([
          {
          name:CicloComercial.name ,schema:CicloComercialSchema
        }])
      ],
  controllers: [CicloComercialController],
  providers: [CicloComercialService],
  exports: [CicloComercialService]
})
export class CicloComercialModule {}
