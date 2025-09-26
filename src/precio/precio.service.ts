import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Precio } from './schema/precio.schema';
import { Model } from 'mongoose';

@Injectable()
export class PrecioService {
      @InjectModel(Precio.name) private readonly precio: Model<Precio>

       async  guardarTipoPrecio(nombre:string){
          const precio = await this.precio.findOne({nombre:nombre})
          if(!precio){
            return this.precio.create({nombre:nombre})
          } 
          return precio
        }
}
