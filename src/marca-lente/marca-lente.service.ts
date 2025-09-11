import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MarcaLente } from './schema/marca-lente.schema';

import { Model } from 'mongoose';

@Injectable()
export class MarcaLenteService {
  constructor(
    @InjectModel(MarcaLente.name)
    private readonly marcaLenteSchema: Model<MarcaLente>,
  ) {}

  public async guardarMarcaLente(nombre: string) {
    const marcaLente = await this.marcaLenteSchema.findOne({ nombre: nombre });
    if (!marcaLente) {
      return this.marcaLenteSchema.create({ nombre: nombre });
    }
    return marcaLente;
  }
}
