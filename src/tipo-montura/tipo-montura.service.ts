import { Injectable } from '@nestjs/common';
import { CreateTipoMonturaDto } from './dto/create-tipo-montura.dto';
import { UpdateTipoMonturaDto } from './dto/update-tipo-montura.dto';
import { InjectModel } from '@nestjs/mongoose';
import { TipoMontura } from './schema/tipo-montura.schema';
import { Model } from 'mongoose';


@Injectable()
export class TipoMonturaService {
    constructor(@InjectModel(TipoMontura.name) private readonly tipoMontura:Model<TipoMontura>){}
    async guardarTipoMontura(nombre:string){
    const tipoMontura= await this.tipoMontura.findOne({nombre:nombre.toUpperCase()})
    if(!tipoMontura){
      return await this.tipoMontura.create({nombre:nombre})
    } 
    return tipoMontura
  }
}
