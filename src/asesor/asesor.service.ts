import { Injectable } from '@nestjs/common';
import { CreateAsesorDto } from './dto/create-asesor.dto';
import { UpdateAsesorDto } from './dto/update-asesor.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Asesor } from './schema/asesor.schema';
import { Model, Types } from 'mongoose';
import { DetalleAsesor } from './schema/detalleAsesor';

@Injectable()
export class AsesorService {
   constructor(
      @InjectModel(Asesor.name)
      private readonly asesor: Model<Asesor>,
      @InjectModel(DetalleAsesor.name)
      private readonly detalleAsesor: Model<DetalleAsesor>,
    ) {}
    
    async guardarAsesor(nombre:string){
      const asesor = await this.asesor.findOne({nombre:nombre})
      if(!asesor){
        return this.asesor.create({nombre:nombre})
      }
      return asesor
    }

    async guardarDetalleAsesor(asesor:Types.ObjectId, sucursal:Types.ObjectId){
        const detalle = await this.detalleAsesor.findOne({sucursal:new Types.ObjectId(sucursal), asesor:new Types.ObjectId(asesor)})
        if(!detalle){
          return this.detalleAsesor.create({sucursal:new Types.ObjectId(sucursal), asesor:new Types.ObjectId(asesor)})
        }
        return detalle
      } 
  
}
