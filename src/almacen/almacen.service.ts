import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Almacen } from './schema/almacenSchema';
import { Model } from 'mongoose';

@Injectable()
export class AlmacenService {
    constructor(
        @InjectModel(Almacen.name)  private readonly almacen:Model<Almacen>,

     ){}


    async  verificarAlmacen(nombre:string){
        const almacen = await this.almacen.findOne({nombre:nombre})
        if(!almacen){
            return this.almacen.create({nombre:nombre})
        }
        return almacen
     }
}
