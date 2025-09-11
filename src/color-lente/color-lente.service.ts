import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ColorLente } from './schema/colorLente.schema';
import { Model } from 'mongoose';

@Injectable()
export class ColorLenteService {
  constructor( @InjectModel(ColorLente.name) private readonly colorLente:Model<ColorLente>){}
 
  public async guardarColorLente(colorLente: string) {
    const tipoColorLente = await this.colorLente.findOne({ nombre: colorLente });
    if (!tipoColorLente) {
      return this.colorLente.create({ nombre: colorLente });
    }
    return tipoColorLente
  }

  
}
