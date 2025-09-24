import { Injectable } from '@nestjs/common';
import { Receta } from './schema/receta.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { recetaI } from './interface/receta';

@Injectable()
export class RecetaService {
  constructor(
    @InjectModel(Receta.name)
    private readonly receta: Model<Receta>,
  ) {}

  async regitrarReceta(data: recetaI) {
    const receta = await this.receta.findOne({ codigoMia: data.codigoMia });    
    if (!receta) {
      return this.receta.create(data);
    }
    return receta;
  }
}
