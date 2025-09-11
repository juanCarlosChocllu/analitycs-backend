import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TipoLente } from './schema/tipo-lente.schema';

import { Model } from 'mongoose';

@Injectable()
export class TipoLenteService {
  constructor(
    @InjectModel(TipoLente.name)
    private readonly TipoLenteSchema: Model<TipoLente>,
  ) {}
  public async guardarTipoLente(nombre: string) {
    const tipoLent = await this.TipoLenteSchema.findOne({ nombre: nombre });
    if (!tipoLent) {
      return this.TipoLenteSchema.create({ nombre: nombre });
    }
    return tipoLent
  }


}
