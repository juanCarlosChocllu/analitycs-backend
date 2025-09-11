import { Module } from '@nestjs/common';
import { MaterialService } from './material.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Material, materialSchema } from './schema/material.schema';


@Module({
  imports:[
    MongooseModule.forFeature([
      {
        name:Material.name, schema:materialSchema
      }
    ])
  ],
  controllers: [],
  providers: [MaterialService],
  exports:[MaterialService]
})
export class MaterialModule {}
